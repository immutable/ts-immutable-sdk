import * as GeneratedClients from '@imtbl/generated-clients';
import { zeroAddress } from 'viem';
import { Auth, IAuthConfiguration } from '@imtbl/auth';
import ConfirmationScreen from '../confirmation/confirmation';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from '../zkEvm/JsonRpcError';
import { MetaTransaction, TypedDataPayload } from '../zkEvm/types';
import { WalletConfiguration } from '../config';
import { getEip155ChainId } from '../zkEvm/walletHelpers';
import { WalletError, WalletErrorType } from '../errors';
import { isAxiosError } from '../utils/http';

export type GuardianClientParams = {
  config: WalletConfiguration;
  auth: Auth;
  guardianApi: GeneratedClients.mr.GuardianApi;
  authConfig: IAuthConfiguration;
};

type GuardianEVMTxnEvaluationParams = {
  chainId: string;
  nonce: string;
  metaTransactions: MetaTransaction[];
  isBackgroundTransaction?: boolean;
};

type GuardianEIP712MessageEvaluationParams = {
  chainID: string;
  payload: TypedDataPayload;
};

type GuardianERC191MessageEvaluationParams = {
  chainID: bigint;
  payload: string;
};

const transactionRejectedCrossSdkBridgeError = 'Transaction requires confirmation but this functionality is not'
  + ' supported in this environment. Please contact Immutable support if you need to enable this feature.';

export const convertBigNumberishToString = (
  value: bigint,
): string => BigInt(value).toString();

const transformGuardianTransactions = (
  txs: MetaTransaction[],
): GeneratedClients.mr.MetaTransaction[] => {
  try {
    return txs.map((t) => ({
      delegateCall: t.delegateCall === true,
      revertOnError: t.revertOnError === true,
      gasLimit: t.gasLimit ? convertBigNumberishToString(t.gasLimit) : '0',
      target: t.to ?? zeroAddress,
      value: t.value ? convertBigNumberishToString(t.value) : '0',
      data: t.data ? t.data.toString() : '0x',
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      `Transaction failed to parsing: ${errorMessage}`,
    );
  }
};

export default class GuardianClient {
  private readonly guardianApi: GeneratedClients.mr.GuardianApi;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly crossSdkBridgeEnabled: boolean;

  private readonly auth: Auth;

  constructor({
    config, auth, guardianApi, authConfig,
  }: GuardianClientParams) {
    this.confirmationScreen = new ConfirmationScreen(authConfig);
    this.crossSdkBridgeEnabled = config.crossSdkBridgeEnabled;
    this.guardianApi = guardianApi;
    this.auth = auth;
  }

  /**
   * Open confirmation screen and close it automatically if the
   * underlying task fails.
   */
  public withConfirmationScreen(popupWindowSize?: {
    width: number;
    height: number;
  }) {
    return <T>(task: () => Promise<T>): Promise<T> => this.withConfirmationScreenTask(popupWindowSize)(task)();
  }

  public withConfirmationScreenTask(popupWindowSize?: {
    width: number;
    height: number;
  }) {
    return <T>(task: () => Promise<T>): (() => Promise<T>) => async () => {
      this.confirmationScreen.loading(popupWindowSize);

      try {
        return await task();
      } catch (err) {
        if (err instanceof WalletError && err.type === WalletErrorType.SERVICE_UNAVAILABLE_ERROR) {
          await this.confirmationScreen.showServiceUnavailable();
          throw err;
        }

        this.confirmationScreen.closeWindow();
        throw err;
      }
    };
  }

  public withDefaultConfirmationScreenTask<T>(task: () => Promise<T>): (() => Promise<T>) {
    return this.withConfirmationScreenTask()(task);
  }

  private async evaluateEVMTransaction({
    chainId,
    nonce,
    metaTransactions,
  }: GuardianEVMTxnEvaluationParams): Promise<GeneratedClients.mr.TransactionEvaluationResponse> {
    const user = await this.auth.getUserZkEvm();
    const headers = { Authorization: `Bearer ${user.accessToken}` };
    const guardianTransactions = transformGuardianTransactions(metaTransactions);
    try {
      const response = await this.guardianApi.evaluateTransaction(
        {
          id: 'evm',
          transactionEvaluationRequest: {
            chainType: 'evm',
            chainId,
            transactionData: {
              nonce,
              userAddress: user.zkEvm.ethAddress,
              metaTransactions: guardianTransactions,
            },
          },
        },
        { headers },
      );

      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        throw new WalletError('Service unavailable', WalletErrorType.SERVICE_UNAVAILABLE_ERROR);
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new JsonRpcError(
        RpcErrorCode.INTERNAL_ERROR,
        `Transaction failed to validate with error: ${errorMessage}`,
      );
    }
  }

  public async validateEVMTransaction({
    chainId,
    nonce,
    metaTransactions,
    isBackgroundTransaction,
  }: GuardianEVMTxnEvaluationParams): Promise<void> {
    const transactionEvaluationResponse = await this.evaluateEVMTransaction({
      chainId,
      nonce,
      metaTransactions,
    });

    const { confirmationRequired, transactionId } = transactionEvaluationResponse;
    if (confirmationRequired && this.crossSdkBridgeEnabled) {
      throw new JsonRpcError(
        RpcErrorCode.TRANSACTION_REJECTED,
        transactionRejectedCrossSdkBridgeError,
      );
    }

    if (confirmationRequired && !!transactionId) {
      const user = await this.auth.getUserZkEvm();
      const confirmationResult = await this.confirmationScreen.requestConfirmation(
        transactionId,
        user.zkEvm.ethAddress,
        GeneratedClients.mr.TransactionApprovalRequestChainTypeEnum.Evm,
        chainId,
      );

      if (!confirmationResult.confirmed) {
        throw new JsonRpcError(
          RpcErrorCode.TRANSACTION_REJECTED,
          'Transaction rejected by user',
        );
      }
      // This verification is meant to ensure that it originates from zkEvmProvider#callSessionActivity
      // and since it's a background transaction should not close the confirmation screen window.
    } else if (!isBackgroundTransaction) {
      this.confirmationScreen.closeWindow();
    }
  }

  private async handleEIP712MessageEvaluation(
    { chainID, payload }: GuardianEIP712MessageEvaluationParams,
  ): Promise<GeneratedClients.mr.MessageEvaluationResponse> {
    try {
      const user = await this.auth.getUserZkEvm();
      if (user === null) {
        throw new JsonRpcError(
          ProviderErrorCode.UNAUTHORIZED,
          'User not logged in. Please log in first.',
        );
      }
      const messageEvalResponse = await this.guardianApi.evaluateMessage(
        { messageEvaluationRequest: { chainID, payload } },
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );
      return messageEvalResponse.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new JsonRpcError(
        RpcErrorCode.INTERNAL_ERROR,
        `Message failed to validate with error: ${errorMessage}`,
      );
    }
  }

  public async evaluateEIP712Message({ chainID, payload }: GuardianEIP712MessageEvaluationParams) {
    const { messageId, confirmationRequired } = await this.handleEIP712MessageEvaluation({ chainID, payload });
    if (confirmationRequired && this.crossSdkBridgeEnabled) {
      throw new JsonRpcError(RpcErrorCode.TRANSACTION_REJECTED, transactionRejectedCrossSdkBridgeError);
    }
    if (confirmationRequired && !!messageId) {
      const user = await this.auth.getUserZkEvm();
      const confirmationResult = await this.confirmationScreen.requestMessageConfirmation(
        messageId,
        user.zkEvm.ethAddress,
        'eip712',
        chainID,
      );

      if (!confirmationResult.confirmed) {
        throw new JsonRpcError(
          RpcErrorCode.TRANSACTION_REJECTED,
          'Signature rejected by user',
        );
      }
    } else {
      this.confirmationScreen.closeWindow();
    }
  }

  private async handleERC191MessageEvaluation(
    { chainID, payload }: GuardianERC191MessageEvaluationParams,
  ): Promise<GeneratedClients.mr.MessageEvaluationResponse> {
    try {
      const user = await this.auth.getUserZkEvm();
      if (user === null) {
        throw new JsonRpcError(
          ProviderErrorCode.UNAUTHORIZED,
          'User not logged in. Please log in first.',
        );
      }
      const messageEvalResponse = await this.guardianApi.evaluateErc191Message(
        {
          eRC191MessageEvaluationRequest: {
            chainID: getEip155ChainId(Number(chainID)),
            payload,
          },
        },
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );
      return messageEvalResponse.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new JsonRpcError(
        RpcErrorCode.INTERNAL_ERROR,
        `Message failed to validate with error: ${errorMessage}`,
      );
    }
  }

  public async evaluateERC191Message({ chainID, payload }: GuardianERC191MessageEvaluationParams) {
    const { messageId, confirmationRequired } = await this.handleERC191MessageEvaluation({ chainID, payload });
    if (confirmationRequired && this.crossSdkBridgeEnabled) {
      throw new JsonRpcError(RpcErrorCode.TRANSACTION_REJECTED, transactionRejectedCrossSdkBridgeError);
    }
    if (confirmationRequired && !!messageId) {
      const user = await this.auth.getUserZkEvm();
      const confirmationResult = await this.confirmationScreen.requestMessageConfirmation(
        messageId,
        user.zkEvm.ethAddress,
        'erc191',
        String(chainID),
      );

      if (!confirmationResult.confirmed) {
        throw new JsonRpcError(
          RpcErrorCode.TRANSACTION_REJECTED,
          'Signature rejected by user',
        );
      }
    } else {
      this.confirmationScreen.closeWindow();
    }
  }
}

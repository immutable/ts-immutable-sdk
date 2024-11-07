import * as GeneratedClients from '@imtbl/generated-clients';
import { BigNumberish, ZeroAddress } from 'ethers';
import axios from 'axios';
import AuthManager from '../authManager';
import { ConfirmationScreen } from '../confirmation';
import { retryWithDelay } from '../network/retry';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from '../zkEvm/JsonRpcError';
import { MetaTransaction, TypedDataPayload } from '../zkEvm/types';
import { PassportConfiguration } from '../config';
import { getEip155ChainId } from '../zkEvm/walletHelpers';
import { PassportError, PassportErrorType } from '../errors/passportError';

export type GuardianClientParams = {
  confirmationScreen: ConfirmationScreen;
  config: PassportConfiguration;
  authManager: AuthManager;
  guardianApi: GeneratedClients.mr.GuardianApi;
};

export type GuardianEvaluateImxTransactionParams = {
  payloadHash: string;
};

type GuardianEVMTxnEvaluationParams = {
  chainId: string;
  nonce: string;
  metaTransactions: MetaTransaction[];
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
  value: BigNumberish,
): string => BigInt(value).toString();

const transformGuardianTransactions = (
  txs: MetaTransaction[],
): GeneratedClients.mr.MetaTransaction[] => {
  try {
    return txs.map((t) => ({
      delegateCall: t.delegateCall === true,
      revertOnError: t.revertOnError === true,
      gasLimit: t.gasLimit ? convertBigNumberishToString(t.gasLimit) : '0',
      target: t.to ?? ZeroAddress,
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

  private readonly authManager: AuthManager;

  constructor({
    confirmationScreen, config, authManager, guardianApi,
  }: GuardianClientParams) {
    this.confirmationScreen = confirmationScreen;
    this.crossSdkBridgeEnabled = config.crossSdkBridgeEnabled;
    this.guardianApi = guardianApi;
    this.authManager = authManager;
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
        if (err instanceof PassportError && err.type === PassportErrorType.SERVICE_UNAVAILABLE_ERROR) {
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

  public async evaluateImxTransaction({ payloadHash }: GuardianEvaluateImxTransactionParams): Promise<void> {
    try {
      const finallyFn = () => {
        this.confirmationScreen.closeWindow();
      };
      const user = await this.authManager.getUserImx();

      const headers = { Authorization: `Bearer ${user.accessToken}` };
      const transactionRes = await retryWithDelay(
        async () => this.guardianApi.getTransactionByID({
          transactionID: payloadHash,
          chainType: 'starkex',
        }, { headers }),
        { finallyFn },
      );

      if (!transactionRes.data.id) {
        throw new Error("Transaction doesn't exists");
      }

      const evaluateImxRes = await this.guardianApi.evaluateTransaction({
        id: payloadHash,
        transactionEvaluationRequest: {
          chainType: 'starkex',
        },
      }, { headers });

      const { confirmationRequired } = evaluateImxRes.data;
      if (confirmationRequired) {
        if (this.crossSdkBridgeEnabled) {
          throw new Error(transactionRejectedCrossSdkBridgeError);
        }

        const confirmationResult = await this.confirmationScreen.requestConfirmation(
          payloadHash,
          user.imx.ethAddress,
          GeneratedClients.mr.TransactionApprovalRequestChainTypeEnum.Starkex,
        );

        if (!confirmationResult.confirmed) {
          throw new Error('Transaction rejected by user');
        }
      } else {
        this.confirmationScreen.closeWindow();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        throw new PassportError('Service unavailable', PassportErrorType.SERVICE_UNAVAILABLE_ERROR);
      }
      throw error;
    }
  }

  private async evaluateEVMTransaction({
    chainId,
    nonce,
    metaTransactions,
  }: GuardianEVMTxnEvaluationParams): Promise<GeneratedClients.mr.TransactionEvaluationResponse> {
    const user = await this.authManager.getUserZkEvm();
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
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        throw new PassportError('Service unavailable', PassportErrorType.SERVICE_UNAVAILABLE_ERROR);
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
      const user = await this.authManager.getUserZkEvm();
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
    } else {
      this.confirmationScreen.closeWindow();
    }
  }

  private async handleEIP712MessageEvaluation(
    { chainID, payload }: GuardianEIP712MessageEvaluationParams,
  ): Promise<GeneratedClients.mr.MessageEvaluationResponse> {
    try {
      const user = await this.authManager.getUserZkEvm();
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
      const user = await this.authManager.getUserZkEvm();
      const confirmationResult = await this.confirmationScreen.requestMessageConfirmation(
        messageId,
        user.zkEvm.ethAddress,
        'eip712',
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
      const user = await this.authManager.getUserZkEvm();
      if (user === null) {
        throw new JsonRpcError(
          ProviderErrorCode.UNAUTHORIZED,
          'User not logged in. Please log in first.',
        );
      }
      const messageEvalResponse = await this.guardianApi.evaluateErc191Message(
        {
          eRC191MessageEvaluationRequest: {
            chainID: getEip155ChainId(chainID),
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
      const user = await this.authManager.getUserZkEvm();
      const confirmationResult = await this.confirmationScreen.requestMessageConfirmation(
        messageId,
        user.zkEvm.ethAddress,
        'erc191',
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

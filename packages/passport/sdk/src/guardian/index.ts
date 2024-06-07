import * as guardian from '@imtbl/guardian';
import { TransactionApprovalRequestChainTypeEnum, TransactionEvaluationResponse } from '@imtbl/guardian';
import { BigNumber, ethers } from 'ethers';
import { PassportError, PassportErrorType } from 'errors/passportError';
import AuthManager from '../authManager';
import { ConfirmationScreen } from '../confirmation';
import { retryWithDelay } from '../network/retry';
import { JsonRpcError, RpcErrorCode } from '../zkEvm/JsonRpcError';
import { MetaTransaction, TypedDataPayload } from '../zkEvm/types';
import { PassportConfiguration } from '../config';

export type GuardianClientParams = {
  confirmationScreen: ConfirmationScreen;
  config: PassportConfiguration;
  authManager: AuthManager;
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
  chainID: string;
  payload: string;
};

const transactionRejectedCrossSdkBridgeError = 'Transaction requires confirmation but this functionality is not'
  + ' supported in this environment. Please contact Immutable support if you need to enable this feature.';

export const convertBigNumberishToString = (
  value: ethers.BigNumberish,
): string => BigNumber.from(value).toString();

const transformGuardianTransactions = (
  txs: MetaTransaction[],
): guardian.MetaTransaction[] => {
  try {
    return txs.map((t) => ({
      delegateCall: t.delegateCall === true,
      revertOnError: t.revertOnError === true,
      gasLimit: t.gasLimit ? convertBigNumberishToString(t.gasLimit) : '0',
      target: t.to ?? ethers.constants.AddressZero,
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
  private readonly transactionAPI: guardian.TransactionsApi;

  private readonly messageAPI: guardian.MessagesApi;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly crossSdkBridgeEnabled: boolean;

  private readonly authManager: AuthManager;

  constructor({ confirmationScreen, config, authManager }: GuardianClientParams) {
    const guardianConfiguration = new guardian.Configuration({ basePath: config.imxPublicApiDomain });
    this.confirmationScreen = confirmationScreen;
    this.crossSdkBridgeEnabled = config.crossSdkBridgeEnabled;
    this.messageAPI = new guardian.MessagesApi(guardianConfiguration);
    this.transactionAPI = new guardian.TransactionsApi(guardianConfiguration);
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
        this.confirmationScreen.closeWindow();
        throw err;
      }
    };
  }

  public withDefaultConfirmationScreenTask<T>(task: () => Promise<T>): (() => Promise<T>) {
    return this.withConfirmationScreenTask()(task);
  }

  public async evaluateImxTransaction({ payloadHash }: GuardianEvaluateImxTransactionParams): Promise<void> {
    const finallyFn = () => {
      this.confirmationScreen.closeWindow();
    };
    const user = await this.authManager.getUserImx();

    const headers = { Authorization: `Bearer ${user.accessToken}` };
    const transactionRes = await retryWithDelay(
      async () => this.transactionAPI.getTransactionByID({
        transactionID: payloadHash,
        chainType: 'starkex',
      }, { headers }),
      { finallyFn },
    );

    if (!transactionRes.data.id) {
      throw new Error("Transaction doesn't exists");
    }

    const evaluateImxRes = await this.transactionAPI.evaluateTransaction({
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
        TransactionApprovalRequestChainTypeEnum.Starkex,
      );

      if (!confirmationResult.confirmed) {
        throw new Error('Transaction rejected by user');
      }
    } else {
      this.confirmationScreen.closeWindow();
    }
  }

  private async evaluateEVMTransaction({
    chainId,
    nonce,
    metaTransactions,
  }: GuardianEVMTxnEvaluationParams): Promise<TransactionEvaluationResponse> {
    const user = await this.authManager.getUserZkEvm();
    const headers = { Authorization: `Bearer ${user.accessToken}` };
    const guardianTransactions = transformGuardianTransactions(metaTransactions);
    try {
      const transactionEvaluationResponseAxiosResponse = await this.transactionAPI.evaluateTransaction(
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
      return transactionEvaluationResponseAxiosResponse.data;
    } catch (error) {
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
        TransactionApprovalRequestChainTypeEnum.Evm,
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
    { chainID, payload }:GuardianEIP712MessageEvaluationParams,
  ): Promise<guardian.MessageEvaluationResponse> {
    try {
      const user = await this.authManager.getUserZkEvm();
      if (user === null) {
        throw new PassportError('handleEIP712MessageEvaluation requires a valid ID token or refresh token. Please log in first', PassportErrorType.NOT_LOGGED_IN_ERROR);
      }
      const messageEvalResponse = await this.messageAPI.evaluateMessage(
        { messageEvaluationRequest: { chainID, payload } },
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );
      return messageEvalResponse.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, `Message failed to validate with error: ${errorMessage}`);
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
    { chainID, payload }:GuardianERC191MessageEvaluationParams,
  ): Promise<guardian.MessageEvaluationResponse> {
    try {
      const user = await this.authManager.getUserZkEvm();
      if (user === null) {
        throw new PassportError('handleERC191MessageEvaluation requires a valid ID token or refresh token. Please log in first', PassportErrorType.NOT_LOGGED_IN_ERROR);
      }
      const messageEvalResponse = await this.messageAPI.evaluateErc191Message(
        { eRC191MessageEvaluationRequest: { chainID, payload } },
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );
      return messageEvalResponse.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, `Message failed to validate with error: ${errorMessage}`);
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

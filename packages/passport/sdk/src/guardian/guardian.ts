import * as guardian from '@imtbl/guardian';
import { TransactionApprovalRequestChainTypeEnum, TransactionEvaluationResponse } from '@imtbl/guardian';
import { BigNumber, ethers } from 'ethers';
import { ConfirmationScreen } from '../confirmation';
import { retryWithDelay } from '../network/retry';
import { JsonRpcError, RpcErrorCode } from '../zkEvm/JsonRpcError';
import { MetaTransaction, TypedDataPayload } from '../zkEvm/types';
import { UserZkEvm } from '../types';
import { PassportConfiguration } from '../config';

export type GuardianClientParams = {
  accessToken: string;
  confirmationScreen: ConfirmationScreen;
  imxEtherAddress: string;
  config: PassportConfiguration;
};

export type GuardianValidateParams = {
  payloadHash: string;
};

type GuardianEVMValidationParams = {
  chainId: string;
  nonce: string;
  user: UserZkEvm;
  metaTransactions: MetaTransaction[];
};

type GuardianMessageValidationParams = {
  chainID: string;
  payload: TypedDataPayload;
  user: UserZkEvm
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

  // TODO: ID-977, make this rollup agnostic
  private readonly imxEtherAddress: string;

  private readonly crossSdkBridgeEnabled: boolean;

  constructor({
    accessToken,
    confirmationScreen,
    imxEtherAddress,
    config,
  }: GuardianClientParams) {
    const guardianConfiguration = new guardian.Configuration({ accessToken, basePath: config.imxPublicApiDomain });
    this.confirmationScreen = confirmationScreen;
    this.transactionAPI = new guardian.TransactionsApi(
      new guardian.Configuration(guardianConfiguration),
    );
    this.imxEtherAddress = imxEtherAddress;
    this.crossSdkBridgeEnabled = config.crossSdkBridgeEnabled;
    this.messageAPI = new guardian.MessagesApi(guardianConfiguration);
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

  public async validate({ payloadHash }: GuardianValidateParams): Promise<void> {
    const finallyFn = () => {
      this.confirmationScreen.closeWindow();
    };

    const transactionRes = await retryWithDelay(
      async () => this.transactionAPI.getTransactionByID({
        transactionID: payloadHash,
        chainType: 'starkex',
      }),
      { finallyFn },
    );

    if (!transactionRes.data.id) {
      throw new Error("Transaction doesn't exists");
    }

    const evaluateStarkexRes = await this.transactionAPI.evaluateTransaction({
      id: payloadHash,
      transactionEvaluationRequest: {
        chainType: 'starkex',
      },
    });

    const { confirmationRequired } = evaluateStarkexRes.data;
    if (confirmationRequired) {
      if (this.crossSdkBridgeEnabled) {
        throw new Error(transactionRejectedCrossSdkBridgeError);
      }

      const confirmationResult = await this.confirmationScreen.requestConfirmation(
        payloadHash,
        this.imxEtherAddress,
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
    user,
    metaTransactions,
  }: GuardianEVMValidationParams): Promise<TransactionEvaluationResponse> {
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
    user,
    metaTransactions,
  }: GuardianEVMValidationParams): Promise<void> {
    const transactionEvaluationResponse = await this.evaluateEVMTransaction({
      chainId,
      nonce,
      user,
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
      const confirmationResult = await this.confirmationScreen.requestConfirmation(
        transactionId,
        this.imxEtherAddress,
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

  private async evaluateMessage(
    { chainID, payload, user }:GuardianMessageValidationParams,
  ): Promise<guardian.MessageEvaluationResponse> {
    try {
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

  public async validateMessage({ chainID, payload, user }: GuardianMessageValidationParams) {
    const { messageId, confirmationRequired } = await this.evaluateMessage({ chainID, payload, user });
    if (confirmationRequired && this.crossSdkBridgeEnabled) {
      throw new JsonRpcError(RpcErrorCode.TRANSACTION_REJECTED, transactionRejectedCrossSdkBridgeError);
    }
    if (confirmationRequired && !!messageId) {
      const confirmationResult = await this.confirmationScreen.requestMessageConfirmation(
        messageId,
        this.imxEtherAddress,
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

import * as guardian from '@imtbl/guardian';
import { TransactionApprovalRequestChainTypeEnum, TransactionEvaluationResponse } from '@imtbl/guardian';
import { BigNumber, ethers } from 'ethers';
import { ConfirmationScreen } from '../confirmation';
import { retryWithDelay } from '../network/retry';
import { JsonRpcError, RpcErrorCode } from '../zkEvm/JsonRpcError';
import { MetaTransaction } from '../zkEvm/types';
import { UserZkEvm } from '../types';

export type GuardianClientParams = {
  accessToken: string;
  imxPublicApiDomain: string;
  confirmationScreen: ConfirmationScreen;
  imxEtherAddress: string;
};

export type GuardianValidateParams = {
  payloadHash: string;
};

type GuardianEVMValidationParams = {
  chainId: string,
  nonce: string,
  user: UserZkEvm,
  metaTransactions: MetaTransaction[],
};

export const convertBigNumberishToString = (value: ethers.BigNumberish): string => BigNumber.from(value).toString();

const transformGuardianTransactions = (txs: MetaTransaction[]): guardian.MetaTransaction[] => {
  try {
    return txs.map((t) => ({
      delegateCall: t.delegateCall === true,
      revertOnError: t.revertOnError === true,
      gasLimit: t.gasLimit ? convertBigNumberishToString(t.gasLimit) : '0',
      target: t.to ?? ethers.constants.AddressZero,
      value: t.value ? convertBigNumberishToString(t.value) : '0',
      data: t.data ? t.data.toString() : '0x00',
    }));
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      `Transaction failed to parsing: ${errorMessage}`,
    );
  }
};

export default class GuardianClient {
  private readonly transactionAPI: guardian.TransactionsApi;

  private readonly confirmationScreen: ConfirmationScreen;

  // TODO: ID-977, make this rollup agnostic
  private readonly imxEtherAddress: string;

  constructor({
    imxPublicApiDomain, accessToken, confirmationScreen, imxEtherAddress,
  }: GuardianClientParams) {
    this.confirmationScreen = confirmationScreen;
    this.transactionAPI = new guardian.TransactionsApi(
      new guardian.Configuration({
        accessToken,
        basePath: imxPublicApiDomain,
      }),
    );
    this.imxEtherAddress = imxEtherAddress;
  }

  public loading(popupWindowSize?: { width: number; height: number }) {
    this.confirmationScreen.loading(popupWindowSize);
  }

  public async validate({ payloadHash }: GuardianValidateParams) {
    const finallyFn = () => {
      this.confirmationScreen.closeWindow();
    };

    const transactionRes = await retryWithDelay(async () => this.transactionAPI.getTransactionByID({
      transactionID: payloadHash,
      chainType: 'starkex',
    }), { finallyFn });

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
      const confirmationResult = await this.confirmationScreen.startGuardianTransaction(
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
    const guardianTransactions = transformGuardianTransactions(
      metaTransactions,
    );
    try {
      const transactionEvaluationResponseAxiosResponse = await this.transactionAPI.evaluateTransaction({
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
      }, { headers });
      return transactionEvaluationResponseAxiosResponse.data;
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
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
    if (confirmationRequired && !!transactionId) {
      const confirmationResult = await this.confirmationScreen.startGuardianTransaction(
        transactionId,
        this.imxEtherAddress,
        TransactionApprovalRequestChainTypeEnum.Evm,
        chainId,
      );

      if (!confirmationResult.confirmed) {
        throw new JsonRpcError(
          RpcErrorCode.USER_REJECTED_REQUEST,
          'Transaction rejected by user ',
        );
      }
    } else {
      this.confirmationScreen.closeWindow();
    }
  }
}

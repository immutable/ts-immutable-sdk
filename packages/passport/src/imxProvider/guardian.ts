import * as guardian from '@imtbl/guardian';
import { retryWithDelay } from 'util/retry';
import { ConfirmationScreen } from '../confirmation';

export type GuardianParams = {
  accessToken: string;
  imxPublicApiDomain: string;
  payloadHash: string;
  confirmationScreen: ConfirmationScreen;
  popupWindowSize?: { width: number; height: number }
};

export type GuardianClientParams = {
  accessToken: string;
  imxPublicApiDomain: string;
  confirmationScreen: ConfirmationScreen;
};

export type GuardianValidateParams = {
  payloadHash: string;
  popupWindowSize?: { width: number; height: number }
};

export default class GuardianClient {
  private transactionAPI: guardian.TransactionsApi;

  private starkExTransactionApi: guardian.StarkexTransactionsApi;

  private confirmationScreen: ConfirmationScreen;

  constructor({ imxPublicApiDomain, accessToken, confirmationScreen }: GuardianClientParams) {
    this.confirmationScreen = confirmationScreen;
    this.transactionAPI = new guardian.TransactionsApi(
      new guardian.Configuration({
        accessToken,
        basePath: imxPublicApiDomain,
      }),
    );
    this.starkExTransactionApi = new guardian.StarkexTransactionsApi(
      new guardian.Configuration({
        accessToken,
        basePath: imxPublicApiDomain,
      }),
    );
  }

  public async validate({ popupWindowSize, payloadHash }: GuardianValidateParams) {
    this.confirmationScreen.loading(popupWindowSize);
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

    const evaluateStarkexRes = await this.starkExTransactionApi.evaluateStarkexTransaction({
      payloadHash,
    });

    const { confirmationRequired } = evaluateStarkexRes.data;
    if (confirmationRequired) {
      const confirmationResult = await this.confirmationScreen.startGuardianTransaction(
        payloadHash,
      );

      if (!confirmationResult.confirmed) {
        throw new Error('Transaction rejected by user');
      }
    } else {
      this.confirmationScreen.closeWindow();
    }
  }
}

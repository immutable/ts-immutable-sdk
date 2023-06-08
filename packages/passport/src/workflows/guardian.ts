import * as guardian from '@imtbl/guardian';
import { retryWithDelay } from 'util/retry';
import { ConfirmationScreen } from '../confirmation';

export type GuardianParams = {
  accessToken: string;
  imxPublicApiDomain: string;
  payloadHash: string;
  confirmationScreen: ConfirmationScreen;
};

export const validateWithGuardian = async ({
  accessToken,
  imxPublicApiDomain,
  payloadHash,
  confirmationScreen,
}: GuardianParams) => {
  const transactionAPI = new guardian.TransactionsApi(
    new guardian.Configuration({
      accessToken,
      basePath: imxPublicApiDomain,
    }),
  );
  const starkExTransactionApi = new guardian.StarkexTransactionsApi(
    new guardian.Configuration({
      accessToken,
      basePath: imxPublicApiDomain,
    }),
  );

  const transactionRes = await retryWithDelay(async () => transactionAPI.getTransactionByID({
    transactionID: payloadHash,
    chainType: 'starkex',
  }));

  if (!transactionRes.data.id) {
    throw new Error("Transaction doesn't exists");
  }

  const evaluateStarkexRes = await starkExTransactionApi.evaluateStarkexTransaction({
    payloadHash,
  });

  const { confirmationRequired } = evaluateStarkexRes.data;
  if (confirmationRequired) {
    const confirmationResult = await confirmationScreen.startGuardianTransaction(
      payloadHash,
    );

    if (!confirmationResult.confirmed) {
      throw new Error('Transaction rejected by user');
    }
  }
};

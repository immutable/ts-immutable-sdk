import * as guardian from '@imtbl/guardian';
import { retryWithDelay } from 'util/retry';
import { ConfirmationScreen } from '../confirmation';

export type GuardianParams = {
  accessToken: string;
  imxPublicApiDomain: string;
  payloadHash: string;
  confirmationScreen: ConfirmationScreen;
};

export type BatchGuardianParams = {
  accessToken: string;
  imxPublicApiDomain: string;
  payloadHashs: string[];
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

export const batchValidateWithGuardian = async ({
  accessToken,
  imxPublicApiDomain,
  payloadHashs,
  confirmationScreen,
}: BatchGuardianParams) => {
  if (payloadHashs.length === 0) {
    throw new Error("Transaction doesn't exists");
  }
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

  const confirmationsRequired: boolean[] = await Promise.all(payloadHashs.map(async (payloadHash: string) => {
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

    return evaluateStarkexRes.data.confirmationRequired;
  }));

  const confirmationRequired = confirmationsRequired.some((confirmation) => confirmation === true);
  const payloadHashsString = payloadHashs.join(',');
  if (confirmationRequired) {
    const confirmationResult = await confirmationScreen.startGuardianTransaction(
      payloadHashsString,
    );

    if (!confirmationResult.confirmed) {
      throw new Error('Transaction rejected by user');
    }
  }
};

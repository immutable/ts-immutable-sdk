/* eslint-disable @typescript-eslint/no-unused-vars */
import { ImmutableX } from '@imtbl/core-sdk';
import { StarkExConfiguration } from 'config';

const StarkExAPIFactory = (config: StarkExConfiguration) => {
  const imtblClient = new ImmutableX(config.immutableXConfig);
  const {
    deposit,
    registerOffchain,
    isRegisteredOnchain,
    prepareWithdrawal,
    completeWithdrawal,
    createOrder,
    cancelOrder,
    createTrade,
    transfer,
    batchNftTransfer,
    ...StarkEx
  } = imtblClient;

  return { ...StarkEx };
};

export { StarkExAPIFactory };

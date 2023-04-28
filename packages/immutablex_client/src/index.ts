import { ImmutableX } from '@imtbl/core-sdk';
import { ImxConfiguration } from 'config';

const ImmutableXClientFactory = (config: ImxConfiguration) => {
  const immutableXClient = new ImmutableX(config.immutableXConfig);
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
    ...imx
  } = immutableXClient;

  return { ...imx };
};

export { ImmutableXClientFactory };

import { ImmutableX } from '@imtbl/core-sdk';
import { ImxConfiguration } from 'config';

const ImxAPIFactory = (config: ImxConfiguration) => {
  const imxClient = new ImmutableX(config.immutableXConfig);
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
  } = imxClient;

  return { ...imx };
};

export { ImxAPIFactory };

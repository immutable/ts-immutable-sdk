import { ImmutableX } from '@imtbl/core-sdk';
import { imxConfiguration } from 'config';

const imxAPIFactory = (config: imxConfiguration) => {
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

export { imxAPIFactory };

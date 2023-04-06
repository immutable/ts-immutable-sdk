import { ImmutableX } from '@imtbl/core-sdk';

/* eslint-disable @typescript-eslint/no-unused-vars */
const StarkExAPIFactory = (config) => {
    const imtblClient = new ImmutableX(config.getStarkExConfig());
    const { deposit, registerOffchain, isRegisteredOnchain, prepareWithdrawal, completeWithdrawal, createOrder, cancelOrder, createTrade, transfer, batchNftTransfer, ...StarkEx } = imtblClient;
    return { ...StarkEx };
};

export { StarkExAPIFactory };

/* eslint-disable @typescript-eslint/no-unused-vars */
import { ImmutableX } from "@imtbl/core-sdk";
import { Configuration } from "@imtbl/config";

const StarkExAPIFactory = (config: Configuration) => {
  const imtblClient = new ImmutableX(config.getStarkExConfig());
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

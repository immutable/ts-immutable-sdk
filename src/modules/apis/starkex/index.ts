/* eslint-disable @typescript-eslint/no-unused-vars */
import { ImmutableX, Config } from '@imtbl/core-sdk';

const imtblClient = new ImmutableX(Config.SANDBOX);
// Remove provider specific methods
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

export { StarkEx };
export * from "./immutable";

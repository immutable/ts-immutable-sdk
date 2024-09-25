import { orderbook } from "@imtbl/sdk";
import { Environment } from "@imtbl/sdk/config";

export const orderbookSDK = new orderbook.Orderbook({
  baseConfig: {
    environment: Environment.SANDBOX,
  },
});

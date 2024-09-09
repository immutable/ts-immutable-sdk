import { orderbook } from "@imtbl/sdk";
import { Environment } from "@imtbl/config";

export const orderbookSDK = new orderbook.Orderbook({
  baseConfig: {
    environment: Environment.SANDBOX,
  },
});

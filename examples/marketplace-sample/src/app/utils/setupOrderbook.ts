import { Orderbook } from "@imtbl/orderbook";
import { Environment } from "@imtbl/sdk/config";

export const orderbookSDK = new Orderbook({
  baseConfig: {
    environment: Environment.SANDBOX,
  },
});

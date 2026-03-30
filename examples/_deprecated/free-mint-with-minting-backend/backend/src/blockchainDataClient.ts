import serverConfig, { environment } from "./config";
import { blockchainData } from "@imtbl/sdk";

export const blockchainDataClient = new blockchainData.BlockchainData({
  baseConfig: {
    environment: environment,
    apiKey: serverConfig[environment].HUB_API_KEY,
    rateLimitingKey: serverConfig[environment].RPS_API_KEY,
  }
});
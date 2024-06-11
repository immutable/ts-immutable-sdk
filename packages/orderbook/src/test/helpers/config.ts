// eslint-disable-next-line import/no-extraneous-dependencies
import dotenv from 'dotenv';
import { OrderbookOverrides } from 'config';

dotenv.config();

export function getConfigFromEnv(): OrderbookOverrides {
  if (
    !process.env.ORDERBOOK_MR_API_URL
    || !process.env.SEAPORT_CONTRACT_ADDRESS
    || !process.env.ZONE_CONTRACT_ADDRESS
    || !process.env.CHAIN_NAME
    || !process.env.RPC_ENDPOINT
  ) {
    throw new Error('missing config');
  }

  return {
    apiEndpoint: process.env.ORDERBOOK_MR_API_URL,
    chainName: process.env.CHAIN_NAME,
    seaportContractAddress: process.env.SEAPORT_CONTRACT_ADDRESS,
    zoneContractAddress: process.env.ZONE_CONTRACT_ADDRESS,
    jsonRpcProviderUrl: process.env.RPC_ENDPOINT,
  };
}

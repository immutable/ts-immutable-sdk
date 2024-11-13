// eslint-disable-next-line import/no-extraneous-dependencies
import { orderbook } from '@imtbl/sdk';
import dotenv from 'dotenv';
import { JsonRpcProvider } from 'ethers';

dotenv.config();

export function getConfigFromEnv(): orderbook.OrderbookModuleConfiguration {
  if (
    !process.env.ORDERBOOK_MR_API_URL
    || !process.env.SEAPORT_CONTRACT_ADDRESS
    || !process.env.ZONE_CONTRACT_ADDRESS
    || !process.env.ZKEVM_CHAIN_NAME
    || !process.env.ZKEVM_RPC_ENDPOINT
  ) {
    throw new Error('missing config');
  }

  return {
    apiEndpoint: process.env.ORDERBOOK_MR_API_URL,
    chainName: process.env.ZKEVM_CHAIN_NAME,
    seaportContractAddress: process.env.SEAPORT_CONTRACT_ADDRESS,
    zoneContractAddress: process.env.ZONE_CONTRACT_ADDRESS,
    provider: new JsonRpcProvider(process.env.ZKEVM_RPC_ENDPOINT),
  };
}

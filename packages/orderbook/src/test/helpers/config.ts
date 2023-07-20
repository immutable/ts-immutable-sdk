// eslint-disable-next-line import/no-extraneous-dependencies
import dotenv from 'dotenv';
import { LOCAL_CHAIN_NAME, OrderbookModuleConfiguration } from 'config';
import { getLocalhostProvider } from './provider';

dotenv.config();

export function getLocalConfigFromEnv(): OrderbookModuleConfiguration {
  if (
    !process.env.ORDERBOOK_MR_API_URL
    || !process.env.SEAPORT_CONTRACT_ADDRESS
    || !process.env.ZONE_CONTRACT_ADDRESS
  ) {
    throw new Error('missing config');
  }

  return {
    apiEndpoint: process.env.ORDERBOOK_MR_API_URL,
    chainName: LOCAL_CHAIN_NAME,
    seaportContractAddress: process.env.SEAPORT_CONTRACT_ADDRESS,
    zoneContractAddress: process.env.ZONE_CONTRACT_ADDRESS,
    provider: getLocalhostProvider(),
  };
}

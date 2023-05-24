// eslint-disable-next-line
import dotenv from 'dotenv';

dotenv.config();

export function getConfig() {
  if (
    !process.env.ORDERBOOK_MR_API_URL
    || !process.env.SEAPORT_CONTRACT_ADDRESS
    || !process.env.ZONE_CONTRACT_ADDRESS
  ) {
    throw new Error('missing config');
  }

  return {
    apiUrl: process.env.ORDERBOOK_MR_API_URL,
    seaportContractAddress: process.env.SEAPORT_CONTRACT_ADDRESS,
    zoneContractAddress: process.env.ZONE_CONTRACT_ADDRESS,
  };
}

import { providers } from 'ethers';
// eslint-disable-next-line
import dotenv from 'dotenv';

dotenv.config();

export function getLocalhostProvider(): providers.JsonRpcProvider {
  const endpoint = process.env.ZKEVM_RPC_ENDPOINT;

  return new providers.JsonRpcProvider(endpoint);
}

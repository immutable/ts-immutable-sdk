import { providers } from 'ethers';
// eslint-disable-next-line
import dotenv from 'dotenv';

dotenv.config();

export function getLocalhostProvider(): providers.JsonRpcProvider {
  const endpoint = process.env.LOCAL_RPC_ENDPOINT;
  if (!endpoint) {
    throw new Error('LOCAL_RPC_ENDPOINT not set');
  }

  return new providers.JsonRpcProvider(endpoint);
}

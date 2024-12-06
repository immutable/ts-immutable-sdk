// eslint-disable-next-line
import dotenv from 'dotenv';
import { JsonRpcProvider } from 'ethers';

dotenv.config();

export function getLocalhostProvider(): JsonRpcProvider {
  const endpoint = process.env.RPC_ENDPOINT;

  return new JsonRpcProvider(endpoint);
}

import { providers } from 'ethers';
// eslint-disable-next-line
import dotenv from 'dotenv';

dotenv.config();

export function getLocalhostProvider(): providers.JsonRpcProvider {
  const endpoint = process.env.RPC_ENDPOINT || 'https://zkevm-rpc.sandbox.x.immutable.com';

  return new providers.JsonRpcProvider(endpoint);
}

import { Environment } from '@imtbl/config';
import { ChainId } from './chainId';

// TODO: https://immutable.atlassian.net/browse/WT-1425
export const CHECKOUT_API_BASE_URL = {
  [Environment.SANDBOX]: 'https://checkout-api.dev.immutable.com',
  [Environment.PRODUCTION]: 'https://checkout-api.sandox.immutable.com',
};

export const ALCHEMY_PATH = {
  [ChainId.ETHEREUM]: '/v1/rpc/eth-mainnet',
  [ChainId.SEPOLIA]: '/v1/rpc/eth-sepolia',
};

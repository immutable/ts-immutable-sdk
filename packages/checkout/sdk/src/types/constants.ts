import { Environment } from '@imtbl/config';
import { ChainId } from './chainId';

// TODO: https://immutable.atlassian.net/browse/WT-1425
/**
 * Base URL for the checkout API based on the environment.
 * @type {Object}
 * @property {string} SANDBOX - The base URL for the sandbox environment.
 * @property {string} PRODUCTION - The base URL for the production environment.
 */
export const CHECKOUT_API_BASE_URL = {
  [Environment.SANDBOX]: 'https://checkout-api.dev.immutable.com',
  [Environment.PRODUCTION]: 'https://checkout-api.sandbox.immutable.com',
};

export const ALCHEMY_PATH = {
  [ChainId.ETHEREUM]: '/v1/rpc/eth-mainnet',
  [ChainId.SEPOLIA]: '/v1/rpc/eth-sepolia',
};

// TODO: Fix with Mainnet release -- https://immutable.atlassian.net/browse/WT-1452
export const ENVIRONMENT_L1_CHAIN_MAP = {
  [Environment.PRODUCTION]: ChainId.SEPOLIA,
  [Environment.SANDBOX]: ChainId.SEPOLIA,
};

// TODO: Fix with Mainnet release -- https://immutable.atlassian.net/browse/WT-1452
export const ENVIRONMENT_L2_CHAIN_MAP = {
  [Environment.PRODUCTION]: ChainId.IMTBL_ZKEVM_TESTNET,
  [Environment.SANDBOX]: ChainId.IMTBL_ZKEVM_DEVNET,
};

/* eslint-disable @typescript-eslint/naming-convention */

import { AxelarChainDetails, BridgeInstance } from '../types';

/**
 * @constant {string} ETH_SEPOLIA_CHAIN_ID - The chain ID for the Ethereum Sepolia testnet (EIP-155 compatible format).
 */
export const ETH_SEPOLIA_CHAIN_ID = '11155111';
/**
 * @constant {string} ETH_MAINNET_CHAIN_ID - The chain ID for the Ethereum mainnet (EIP-155 compatible format).
 */
export const ETH_MAINNET_CHAIN_ID = '1';
/**
 * @constant {string} ZKEVM_DEVNET_CHAIN_ID - The chain ID for the zkEVM devnet (EIP-155 compatible format).
 */
export const ZKEVM_DEVNET_CHAIN_ID = '15003';
/**
 * @constant {string} ZKEVM_TESTNET_CHAIN_ID - The chain ID for the zkEVM testnet (EIP-155 compatible format).
 */
export const ZKEVM_TESTNET_CHAIN_ID = '13473';
/**
 * @constant {string} ZKEVM_MAINNET_CHAIN_ID - The chain ID for the zkEVM mainnet (EIP-155 compatible format).
 */
export const ZKEVM_MAINNET_CHAIN_ID = '13371'; // @TODO confirm this is still correct

/**
 * @constant {string} IMTBL_ZKEVM_NATIVE_TOKEN_ADDRESS - Address of the native token on the child chain.
 */
export const IMTBL_ZKEVM_NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000fff';

/**
 * @constant {string} CHILD_CHAIN_NATIVE_TOKEN_ADDRESS - Address of the native token on the child chain.
 */
export const ETHEREUM_NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000eee';

/**
 * @constant {BridgeInstance} ETH_SEPOLIA_TO_ZKEVM_DEVNET - A bridge instance configuration for bridging between
 * the Ethereum Sepolia testnet and the zkEVM devnet.
 */
export const ETH_SEPOLIA_TO_ZKEVM_DEVNET: BridgeInstance = {
  rootChainID: ETH_SEPOLIA_CHAIN_ID,
  childChainID: ZKEVM_DEVNET_CHAIN_ID,
};

/**
 * @constant {BridgeInstance} ETH_SEPOLIA_TO_ZKEVM_TESTNET - A bridge instance configuration for bridging
 * between the Ethereum Sepolia testnet and the zkEVM testnet.
 */
export const ETH_SEPOLIA_TO_ZKEVM_TESTNET: BridgeInstance = {
  rootChainID: ETH_SEPOLIA_CHAIN_ID,
  childChainID: ZKEVM_TESTNET_CHAIN_ID,
};

/**
 * @constant {BridgeInstance} ETH_MAINNET_TO_ZKEVM_MAINNET - A bridge instance configuration for bridging
 * between the Ethereum mainnet and the zkEVM mainnet.
 */
export const ETH_MAINNET_TO_ZKEVM_MAINNET: BridgeInstance = {
  rootChainID: ETH_MAINNET_CHAIN_ID,
  childChainID: ZKEVM_MAINNET_CHAIN_ID,
};

/**
 * @typedef {Object} axelarAPIEndpoints - API endpoints for the testnet & mainnet Axelar environment configurations
 */
export const axelarAPIEndpoints:Record<string, string> = {
  mainnet: 'https://api.gmp.axelarscan.io',
  testnet: 'https://testnet.api.gmp.axelarscan.io',
  devnet: 'https://stagenet.api.gmp.axelarscan.io',
};

/**
 * @typedef {Object} tenderlyAPIEndpoints - API endpoints for the testnet & mainnet Axelar environment configurations
 */
export const tenderlyAPIEndpoints:Record<string, string> = {
  mainnet: 'https://bridge-api.immutable.com/v1/tenderly/simulate',
  testnet: 'https://bridge-api.sandbox.immutable.com/v1/tenderly/simulate',
  devnet: 'https://bridge-api.dev.immutable.com/v1/tenderly/simulate',
};

/**
 * @typedef {Object} axelarChains
 * @property {AxelarChainDetails} [chainId] - Mapping of the ChainId to the Axelar chain id string and symbol.
 */
export const axelarChains:Record<string, AxelarChainDetails> = {
  11155111: {
    id: 'ethereum-sepolia',
    symbol: 'ETH',
  }, // ethereum testnet
  1: {
    id: 'ethereum',
    symbol: 'ETH',
  }, // ethereum mainnet
  15003: {
    id: 'immutable',
    symbol: 'IMX',
  }, // immutable zkevm devnet
  13473: {
    id: 'immutable',
    symbol: 'IMX',
  }, // immutable zkevm testnet
  13371: {
    id: 'immutable',
    symbol: 'IMX',
  }, // immutable zkevm mainnet
};

/**
 * @typedef {Object} bridgeMethods
 * @property {string} deposit - The set of contract methods for depositing.
 * @property {string} withdraw - The set of contract methods for withdrawing.
 */
export const bridgeMethods = {
  deposit: {
    token: 'deposit',
    tokenTo: 'depositTo',
    native: 'depositETH',
    nativeTo: 'depositToETH',
  },
  withdraw: {
    token: 'withdraw',
    tokenTo: 'withdrawTo',
    native: 'withdrawIMX',
    nativeTo: 'withdrawIMXTo',
  },
};

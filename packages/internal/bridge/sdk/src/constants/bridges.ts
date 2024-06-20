/* eslint-disable @typescript-eslint/naming-convention */

import { AxelarChainDetails, BridgeInstance } from '../types';

/**
 * @constant {string} NATIVE - The native token representation.
 */
export const NATIVE = 'NATIVE';

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
 * @constant {string} WITHDRAW_SIG - Signature of the withdraw command, this is keccak256("WITHDRAW").
 */
export const WITHDRAW_SIG = '0x7a8dc26796a1e50e6e190b70259f58f6a4edd5b22280ceecc82b687b8e982869';

/**
 * @constant {string} SLOT_PREFIX_CONTRACT_CALL_APPROVED - The prefix of the storage slot to store contract call approved mapping
 * in axelar gateway proxy.
 */
export const SLOT_PREFIX_CONTRACT_CALL_APPROVED = '0x07b0d4304f82012bd3b70b1d531c160e326067c90829e2a3d386722ad10b89c3';

/**
 * @constant {string} SLOT_POS_CONTRACT_CALL_APPROVED - The position of the storage slot to store contract call approved mapping.
 */
export const SLOT_POS_CONTRACT_CALL_APPROVED = 4;

/**
 * @typedef {Object} childWIMXs - Child Wrapped IMX address for the testnet & mainnet.
 */
export const childWIMXs:Record<string, string> = {
  mainnet: '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
  testnet: '0x1CcCa691501174B4A623CeDA58cC8f1a76dc3439',
  devnet: '',
};

/**
 * @typedef {Object} rootIMXs - Root IMX address for the testnet & mainnet.
 */
export const rootIMXs:Record<string, string> = {
  mainnet: '0xf57e7e7c23978c3caec3c3548e3d615c346e79ff',
  testnet: '0xe2629e08f4125d14e446660028bD98ee60EE69F2',
  devnet: '',
};

/**
 * @typedef {Object} childETHs - Child ETH address for the testnet & mainnet.
 */
export const childETHs:Record<string, string> = {
  mainnet: '0x52a6c53869ce09a731cd772f245b97a4401d3348',
  testnet: '0xe9E96d1aad82562b7588F03f49aD34186f996478',
  devnet: '',
};

/**
 * @typedef {Object} childAdaptors - Child Adaptor address for the testnet & mainnet.
 */
export const childAdaptors:Record<string, string> = {
  mainnet: '0x4f49b53928a71e553bb1b0f66a5bcb54fd4e8932',
  testnet: '0x6328Ac88ba8D466a0F551FC7C42C61d1aC7f92ab',
  devnet: '',
};

/**
 * @typedef {Object} rootAdaptors - Root Adaptor address for the testnet & mainnet.
 */
export const rootAdaptors:Record<string, string> = {
  mainnet: '0x4f49b53928a71e553bb1b0f66a5bcb54fd4e8932',
  testnet: '0x6328Ac88ba8D466a0F551FC7C42C61d1aC7f92ab',
  devnet: '',
};

/**
 * @typedef {Object} childChains - Child Chain name for the testnet & mainnet.
 */
export const childChains:Record<string, string> = {
  mainnet: 'immutable',
  testnet: 'immutable',
  devnet: '',
};

/**
 * @typedef {Object} axelarGateways - Axelar gateway address for the testnet & mainnet.
 */
export const axelarGateways:Record<string, string> = {
  mainnet: '0x4F4495243837681061C4743b74B3eEdf548D56A5',
  testnet: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  devnet: '',
};

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
  mainnet: 'https://bridge-api.immutable.com/v1/tenderly/estimate',
  testnet: 'https://bridge-api.sandbox.immutable.com/v1/tenderly/estimate',
  devnet: 'https://bridge-api.dev.immutable.com/v1/tenderly/estimate',
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

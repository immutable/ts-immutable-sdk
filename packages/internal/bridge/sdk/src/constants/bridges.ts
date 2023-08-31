import { BridgeInstance } from 'types';

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
export const ZKEVM_DEVNET_CHAIN_ID = '13473';
/**
 * @constant {string} ZKEVM_TESTNET_CHAIN_ID - The chain ID for the zkEVM testnet (EIP-155 compatible format).
 */
export const ZKEVM_TESTNET_CHAIN_ID = '13472';
/**
 * @constant {string} ZKEVM_MAINNET_CHAIN_ID - The chain ID for the zkEVM mainnet (EIP-155 compatible format).
 */
export const ZKEVM_MAINNET_CHAIN_ID = '13371';

/**
 * @constant {string} CHILD_CHAIN_NATIVE_TOKEN_ADDRESS - Address of the native token on the child chain.
 */
export const CHILD_CHAIN_NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000001010';

/**
 * @constant {string} L2_STATE_SENDER_ADDRESS - Address of bridge contract to the rootchain
 */
export const L2_STATE_SENDER_ADDRESS = '0x0000000000000000000000000000000000001002';

/**
 * The constant value representing the native token in the token bridge context.
 * The key is used to indicate the native token of a blockchain network (like Ether in Ethereum)
 *  in methods that normally require a token address.
 * @constant {string}
 */
export const NATIVE_TOKEN_BRIDGE_KEY = '0x0000000000000000000000000000000000000001';

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

/**
 * Enum representing different chain IDs.
 * @enum {number}
 * @property {number} IMTBL_ZKEVM_MAINNET - The chain ID for IMTBL ZKEVM Mainnet.
 * @property {number} IMTBL_ZKEVM_TESTNET - The chain ID for IMTBL ZKEVM Testnet.
 * @property {number} IMTBL_ZKEVM_DEVNET - The chain ID for IMTBL ZKEVM Devnet.
 * @property {number} ETHEREUM - The chain ID for Ethereum.
 * @property {number} SEPOLIA - The chain ID for Sepolia.
 */
export enum ChainId {
  IMTBL_ZKEVM_MAINNET = 13371,
  IMTBL_ZKEVM_TESTNET = 13473,
  IMTBL_ZKEVM_DEVNET = 15003,
  ETHEREUM = 1,
  SEPOLIA = 11155111,
}

/**
 * Enum representing different chain names.
 * @enum {string}
 * @property {string} IMTBL_ZKEVM_MAINNET - The chain name for IMTBL ZKEVM Mainnet.
 * @property {string} IMTBL_ZKEVM_TESTNET - The chain name for IMTBL ZKEVM Testnet.
 * @property {string} IMTBL_ZKEVM_DEVNET - The chain name for IMTBL ZKEVM Devnet.
 * @property {string} ETHEREUM - The chain name for Ethereum.
 * @property {string} SEPOLIA - The chain name for Sepolia.
 */
export enum ChainName {
  ETHEREUM = 'Ethereum',
  SEPOLIA = 'Sepolia',
  IMTBL_ZKEVM_TESTNET = 'Immutable zkEVM Testnet',
  IMTBL_ZKEVM_DEVNET = 'Immutable zkEVM Dev',
  IMTBL_ZKEVM_MAINNET = 'Immutable zkEVM',
}

/**
 * Enum representing different chain slugs.
 * @enum {string}
 * @property {string} IMTBL_ZKEVM_MAINNET - The chain slug for IMTBL ZKEVM Mainnet.
 * @property {string} IMTBL_ZKEVM_TESTNET - The chain slug for IMTBL ZKEVM Testnet.
 * @property {string} IMTBL_ZKEVM_DEVNET - The chain slug for IMTBL ZKEVM Devnet.
 * @property {string} ETHEREUM - The chain slug for Ethereum.
 * @property {string} SEPOLIA - The chain slug for Sepolia.
 */
export enum ChainSlug {
  ETHEREUM = 'ethereum',
  SEPOLIA = 'sepolia',
  IMTBL_ZKEVM_MAINNET = 'imtbl-zkevm-mainnet',
  IMTBL_ZKEVM_TESTNET = 'imtbl-zkevm-testnet',
  IMTBL_ZKEVM_DEVNET = 'imtbl-zkevm-devnet',
}

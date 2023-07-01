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
  IMTBL_ZKEVM_TESTNET = 13382,
  IMTBL_ZKEVM_DEVNET = 13393,
  ETHEREUM = 1,
  SEPOLIA = 11155111,
}

/**
 * Enum representing different chain names.
 * @enum {number}
 * @property {number} IMTBL_ZKEVM_MAINNET - The chain name for IMTBL ZKEVM Mainnet.
 * @property {number} IMTBL_ZKEVM_TESTNET - The chain name for IMTBL ZKEVM Testnet.
 * @property {number} IMTBL_ZKEVM_DEVNET - The chain name for IMTBL ZKEVM Devnet.
 * @property {number} ETHEREUM - The chain name for Ethereum.
 * @property {number} SEPOLIA - The chain name for Sepolia.
 */
export enum ChainName {
  ETHEREUM = 'Ethereum',
  SEPOLIA = 'Sepolia',
  IMTBL_ZKEVM_TESTNET = 'Immutable zkEVM Test',
  IMTBL_ZKEVM_DEVNET = 'Immutable zkEVM Dev',
  IMTBL_ZKEVM_MAINNET = 'Immutable zkEVM',
}

/**
 * Enum representing different chain IDs.
 * @enum {number}
 * @property {number} ETHEREUM - The chain ID for Ethereum.
 * @property {number} IMTBL_ZKEVM_TESTNET - The chain ID for IMTBL ZKEVM Testnet.
 * @property {number} SEPOLIA - The chain ID for Sepolia.
 * @property {number} IMTBL_ZKEVM_DEVNET - The chain ID for IMTBL ZKEVM Devnet.
 */
export enum ChainId {
  ETHEREUM = 1,
  IMTBL_ZKEVM_TESTNET = 13372, // to be used in prod config for testnet launch
  SEPOLIA = 11155111,
  IMTBL_ZKEVM_DEVNET = 13383,
}

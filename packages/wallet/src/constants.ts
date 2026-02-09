/**
 * Chain ID constants for Immutable networks
 */

/** Immutable zkEVM Mainnet chain ID */
export const IMMUTABLE_ZKEVM_MAINNET_CHAIN_ID = 13371;

/** Immutable zkEVM Testnet chain ID */
export const IMMUTABLE_ZKEVM_TESTNET_CHAIN_ID = 13473;

/**
 * Magic configuration for Immutable networks
 * @internal
 */
export const MAGIC_CONFIG = {
  [IMMUTABLE_ZKEVM_MAINNET_CHAIN_ID]: {
    magicPublishableApiKey: 'pk_live_10F423798A540ED7',
    magicProviderId: 'aa80b860-8869-4f13-9000-6a6ad3d20017',
  },
  [IMMUTABLE_ZKEVM_TESTNET_CHAIN_ID]: {
    magicPublishableApiKey: 'pk_live_10F423798A540ED7',
    magicProviderId: 'aa80b860-8869-4f13-9000-6a6ad3d20017',
  },
} as const;

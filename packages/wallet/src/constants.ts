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
    magicPublishableApiKey: 'pk_live_D02F278E25B3E5F3',
    magicProviderId: 'imtbl-immutable-zkEVM',
  },
  [IMMUTABLE_ZKEVM_TESTNET_CHAIN_ID]: {
    magicPublishableApiKey: 'pk_live_620E2F8860D1D79E',
    magicProviderId: 'imtbl-immutable-zkEVM-testnet',
  },
} as const;

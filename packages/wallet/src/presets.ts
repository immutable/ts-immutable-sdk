import { ChainConfig } from './types';
import {
  IMMUTABLE_ZKEVM_MAINNET_CHAIN_ID,
  IMMUTABLE_ZKEVM_TESTNET_CHAIN_ID,
} from './constants';

/**
 * Immutable zkEVM Mainnet chain configuration
 */
export const IMMUTABLE_ZKEVM_MAINNET_CHAIN: ChainConfig = {
  chainId: IMMUTABLE_ZKEVM_MAINNET_CHAIN_ID,
  name: 'Immutable zkEVM',
  rpcUrl: 'https://rpc.immutable.com',
  relayerUrl: 'https://api.immutable.com/relayer-mr',
  apiUrl: 'https://api.immutable.com',
  passportDomain: 'https://passport.immutable.com',
  magicPublishableApiKey: 'pk_live_D02F278E25B3E5F3',
  magicProviderId: 'imtbl-immutable-zkEVM',
  magicTeeBasePath: 'https://tee.express.magiclabs.com',
};

/**
 * Immutable zkEVM Testnet chain configuration
 */
export const IMMUTABLE_ZKEVM_TESTNET_CHAIN: ChainConfig = {
  chainId: IMMUTABLE_ZKEVM_TESTNET_CHAIN_ID,
  name: 'Immutable zkEVM Testnet',
  rpcUrl: 'https://rpc.testnet.immutable.com',
  relayerUrl: 'https://api.sandbox.immutable.com/relayer-mr',
  apiUrl: 'https://api.sandbox.immutable.com',
  passportDomain: 'https://passport.sandbox.immutable.com',
  magicPublishableApiKey: 'pk_live_620E2F8860D1D79E',
  magicProviderId: 'imtbl-immutable-zkEVM-testnet',
  magicTeeBasePath: 'https://tee.express.magiclabs.com',
};

/**
 * Default chains (testnet + mainnet)
 * Testnet is first (default initial chain)
 */
export const DEFAULT_CHAINS: ChainConfig[] = [
  IMMUTABLE_ZKEVM_TESTNET_CHAIN,
  IMMUTABLE_ZKEVM_MAINNET_CHAIN,
];

/**
 * Mainnet only preset
 *
 * @example
 * ```typescript
 * const provider = await connectWallet({
 *   ...IMMUTABLE_ZKEVM_MAINNET,
 *   auth,
 * });
 * ```
 */
export const IMMUTABLE_ZKEVM_MAINNET = {
  chains: [IMMUTABLE_ZKEVM_MAINNET_CHAIN],
};

/**
 * Testnet only preset
 *
 * @example
 * ```typescript
 * const provider = await connectWallet({
 *   ...IMMUTABLE_ZKEVM_TESTNET,
 *   auth,
 * });
 * ```
 */
export const IMMUTABLE_ZKEVM_TESTNET = {
  chains: [IMMUTABLE_ZKEVM_TESTNET_CHAIN],
};

/**
 * Multi-chain preset (testnet + mainnet)
 * Defaults to testnet as initial chain
 *
 * @example
 * ```typescript
 * const provider = await connectWallet({
 *   ...IMMUTABLE_ZKEVM_MULTICHAIN,
 *   auth,
 *   initialChainId: IMMUTABLE_ZKEVM_MAINNET_CHAIN_ID, // Optional: start on mainnet
 * });
 * ```
 */
export const IMMUTABLE_ZKEVM_MULTICHAIN = {
  chains: DEFAULT_CHAINS,
};

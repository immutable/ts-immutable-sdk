import { Environment } from '@imtbl/config';
import { ChainConfig, EvmChain } from './types';
import {
  ARBITRUM_ONE_CHAIN,
  ARBITRUM_SEPOLIA_CHAIN,
} from './presets';

/**
 * Registry mapping (EvmChain, Environment) to ChainConfig
 * Add new chains here - no changes needed in Passport.ts
 */
const CHAIN_REGISTRY: Record<Exclude<EvmChain, EvmChain.ZKEVM>, Record<Environment, ChainConfig>> = {
  [EvmChain.ARBITRUM_ONE]: {
    [Environment.PRODUCTION]: ARBITRUM_ONE_CHAIN,
    [Environment.SANDBOX]: ARBITRUM_SEPOLIA_CHAIN,
  },
};

/**
 * Get chain config for non-zkEVM chains
 * @throws Error if chain is not in registry
 */
export function getChainConfig(
  chain: Exclude<EvmChain, EvmChain.ZKEVM>,
  environment: Environment,
): ChainConfig {
  const envConfigs = CHAIN_REGISTRY[chain];
  if (!envConfigs) {
    throw new Error(`Chain ${chain} is not supported`);
  }

  const config = envConfigs[environment];
  if (!config) {
    throw new Error(`Chain ${chain} is not configured for environment ${environment}`);
  }

  return config;
}

import { Environment } from '@imtbl/config';
import { ChainConfig, EvmChain } from '../types';
import {
  IMMUTABLE_ZKEVM_MAINNET_CHAIN,
  IMMUTABLE_ZKEVM_TESTNET_CHAIN,
  ARBITRUM_ONE_CHAIN,
  ETHEREUM_SEPOLIA_CHAIN,
} from './presets';
import { ChainId } from './chains';

/**
 * Registry mapping (EvmChain, Environment) to ChainConfig
 */
const CHAIN_REGISTRY: Record<EvmChain, Record<Environment, ChainConfig>> = {
  [EvmChain.ZKEVM]: {
    [Environment.PRODUCTION]: IMMUTABLE_ZKEVM_MAINNET_CHAIN,
    [Environment.SANDBOX]: IMMUTABLE_ZKEVM_TESTNET_CHAIN,
  },
  [EvmChain.ARBITRUM_ONE]: {
    [Environment.PRODUCTION]: ARBITRUM_ONE_CHAIN,
    [Environment.SANDBOX]: ETHEREUM_SEPOLIA_CHAIN,
  },
};

/**
 * Build chainId → EvmChain mapping from CHAIN_REGISTRY (derived, not manual)
 */
function buildChainIdToEvmChainMap(): Record<number, EvmChain> {
  const map: Record<number, EvmChain> = {};
  for (const [evmChain, envConfigs] of Object.entries(CHAIN_REGISTRY)) {
    for (const config of Object.values(envConfigs)) {
      map[config.chainId] = evmChain as EvmChain;
    }
  }
  // Devnet doesn't have a preset
  map[ChainId.IMTBL_ZKEVM_DEVNET] = EvmChain.ZKEVM;
  return map;
}

const CHAIN_ID_TO_EVM_CHAIN = buildChainIdToEvmChainMap();

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

/**
 * Get EvmChain from chainId
 * @param chainId - Chain ID (can be number or string like "eip155:42161")
 * @returns EvmChain enum value, defaults to ZKEVM if not found
 */
export function getEvmChainFromChainId(chainId: string | number): EvmChain {
  const numericChainId = typeof chainId === 'string'
    ? parseInt(chainId.includes(':') ? chainId.split(':')[1] : chainId, 10)
    : chainId;

  return CHAIN_ID_TO_EVM_CHAIN[numericChainId] ?? EvmChain.ZKEVM;
}

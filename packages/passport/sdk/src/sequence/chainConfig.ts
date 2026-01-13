import { EvmChain } from "../types";
import { Environment } from "@imtbl/config";

export type ChainConfig = {
    chainId: number;
    relayerUrl: string;
    nodeUrl: string;
    rpcUrl: string;
};
  
const CHAIN_CONFIGS: Record<Exclude<EvmChain, EvmChain.ZKEVM>, Record<Environment, ChainConfig>> = {
    [EvmChain.ARBITRUM_ONE]: {
        [Environment.PRODUCTION]: {
            chainId: 42161,
            relayerUrl: 'https://next-arbitrum-one-relayer.sequence.app',
            nodeUrl: 'https://next-nodes.sequence.app/arbitrum-one',
            rpcUrl: 'https://arb1.arbitrum.io/rpc',
        },
        [Environment.SANDBOX]: {
            chainId: 421614,
            relayerUrl: 'https://next-arbitrum-sepolia-relayer.sequence.app',
            nodeUrl: 'https://next-nodes.sequence.app/arbitrum-sepolia',
            rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
        }
    },
};

export function getChainConfig(chain: EvmChain, environment: Environment): ChainConfig {
    if (chain === EvmChain.ZKEVM) {
        throw new Error('ZKEVM does not use Sequence relayer');
    }
    
    const config = CHAIN_CONFIGS[chain as Exclude<EvmChain, EvmChain.ZKEVM>];
    if (!config) {
        throw new Error(`Chain ${chain} is not supported`);
    }
    
    return config[environment];
}

export function getEvmChainFromChainId(chainId: string): EvmChain {
    const numericChainId = parseInt(chainId.includes(':') ? chainId.split(':')[1] : chainId, 10);

    for (const [evmChain, envConfigs] of Object.entries(CHAIN_CONFIGS)) {
        for (const config of Object.values(envConfigs)) {
            if (config.chainId === numericChainId) {
                return evmChain as EvmChain;
            }
        }
    }

    throw new Error(`Chain ${chainId} is not supported`);
}
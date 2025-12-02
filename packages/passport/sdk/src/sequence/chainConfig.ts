import { EvmChain } from "../types";

export type ChainConfig = {
    chainId: number;
    relayerUrl: string;
    nodeUrl: string;
    rpcUrl: string;
};
  
const CHAIN_CONFIGS: Record<Exclude<EvmChain, EvmChain.ZKEVM>, ChainConfig> = {
    [EvmChain.ARBITRUM_ONE]: {
        chainId: 421614,
        relayerUrl: 'https://next-arbitrum-one-relayer.sequence.app',
        nodeUrl: 'https://next-nodes.sequence.app/arbitrum-one',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
    },
    [EvmChain.ARBITRUM_SEPOLIA]: {
        chainId: 421614,
        relayerUrl: 'https://next-arbitrum-sepolia-relayer.sequence.app',
        nodeUrl: 'https://next-nodes.sequence.app/arbitrum-sepolia',
        rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    },
};

export function getChainConfig(chain: EvmChain): ChainConfig {
    if (chain === EvmChain.ZKEVM) {
        throw new Error('ZKEVM does not use Sequence relayer');
    }
    
    const config = CHAIN_CONFIGS[chain as Exclude<EvmChain, EvmChain.ZKEVM>];
    if (!config) {
        throw new Error(`Chain ${chain} is not supported`);
    }
    
    return config;
}
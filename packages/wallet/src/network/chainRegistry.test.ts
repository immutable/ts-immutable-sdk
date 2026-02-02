import { Environment } from '@imtbl/config';
import { getChainConfig, getEvmChainFromChainId } from './chainRegistry';
import { EvmChain } from '../types';
import { ARBITRUM_ONE_CHAIN, ETHEREUM_SEPOLIA_CHAIN } from './presets';

describe('chainRegistry', () => {
  describe('getChainConfig', () => {
    it('returns Arbitrum One mainnet config for PRODUCTION', () => {
      const config = getChainConfig(EvmChain.ARBITRUM_ONE, Environment.PRODUCTION);

      expect(config).toEqual(ARBITRUM_ONE_CHAIN);
      expect(config.chainId).toBe(42161);
      expect(config.name).toBe('Arbitrum One');
    });

    it('returns Ethereum Sepolia config for SANDBOX', () => {
      const config = getChainConfig(EvmChain.ARBITRUM_ONE, Environment.SANDBOX);

      expect(config).toEqual(ETHEREUM_SEPOLIA_CHAIN);
      expect(config.chainId).toBe(11155111);
      expect(config.name).toBe('Ethereum Sepolia');
    });

    it('throws error for unsupported chain', () => {
      expect(() => {
        getChainConfig('unsupported_chain' as any, Environment.PRODUCTION);
      }).toThrow('Chain unsupported_chain is not supported');
    });
  });

  describe('getEvmChainFromChainId', () => {
    it('returns ZKEVM for mainnet chainId', () => {
      expect(getEvmChainFromChainId(13371)).toBe(EvmChain.ZKEVM);
    });

    it('returns ZKEVM for testnet chainId', () => {
      expect(getEvmChainFromChainId(13473)).toBe(EvmChain.ZKEVM);
    });

    it('returns ZKEVM for devnet chainId', () => {
      expect(getEvmChainFromChainId(15003)).toBe(EvmChain.ZKEVM);
    });

    it('returns ARBITRUM_ONE for Arbitrum mainnet chainId', () => {
      expect(getEvmChainFromChainId(42161)).toBe(EvmChain.ARBITRUM_ONE);
    });

    it('returns ARBITRUM_ONE for Ethereum Sepolia chainId', () => {
      expect(getEvmChainFromChainId(11155111)).toBe(EvmChain.ARBITRUM_ONE);
    });

    it('handles string chainId', () => {
      expect(getEvmChainFromChainId('42161')).toBe(EvmChain.ARBITRUM_ONE);
    });

    it('handles eip155 format chainId', () => {
      expect(getEvmChainFromChainId('eip155:42161')).toBe(EvmChain.ARBITRUM_ONE);
    });

    it('defaults to ZKEVM for unknown chainId', () => {
      expect(getEvmChainFromChainId(99999)).toBe(EvmChain.ZKEVM);
    });
  });
});

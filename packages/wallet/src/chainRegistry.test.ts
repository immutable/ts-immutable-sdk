import { Environment } from '@imtbl/config';
import { getChainConfig } from './chainRegistry';
import { EvmChain } from './types';
import { ARBITRUM_ONE_CHAIN, ARBITRUM_SEPOLIA_CHAIN } from './presets';

describe('chainRegistry', () => {
  describe('getChainConfig', () => {
    it('returns Arbitrum One mainnet config for PRODUCTION', () => {
      const config = getChainConfig(EvmChain.ARBITRUM_ONE, Environment.PRODUCTION);

      expect(config).toEqual(ARBITRUM_ONE_CHAIN);
      expect(config.chainId).toBe(42161);
      expect(config.name).toBe('Arbitrum One');
    });

    it('returns Arbitrum Sepolia config for SANDBOX', () => {
      const config = getChainConfig(EvmChain.ARBITRUM_ONE, Environment.SANDBOX);

      expect(config).toEqual(ARBITRUM_SEPOLIA_CHAIN);
      expect(config.chainId).toBe(421614);
      expect(config.name).toBe('Arbitrum Sepolia');
    });

    it('throws error for unsupported chain', () => {
      expect(() => {
        getChainConfig('unsupported_chain' as any, Environment.PRODUCTION);
      }).toThrow('Chain unsupported_chain is not supported');
    });
  });
});

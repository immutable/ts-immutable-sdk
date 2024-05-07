import { ETH_MAINNET_TO_ZKEVM_MAINNET, ETH_SEPOLIA_TO_ZKEVM_TESTNET } from 'constants/bridges';
import { exportedForTesting } from './utils';

describe('utils', () => {
  describe('getAddresses', () => {
    it('should return mainnet address', () => {
      const source = ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID;
      const addresses = { mainnet: 'mainnet', testnet: 'testnet', devnet: 'devnet' };
      const result = exportedForTesting.getAddresses(source, addresses);
      expect(result).toEqual('mainnet');
    });

    it('should return testnet address', () => {
      const source = ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID;
      const addresses = { mainnet: 'mainnet', testnet: 'testnet', devnet: 'devnet' };
      const result = exportedForTesting.getAddresses(source, addresses);
      expect(result).toEqual('testnet');
    });

    it('should return devnet address in all other cases', () => {
      const source = 'devnet';
      const addresses = { mainnet: 'mainnet', testnet: 'testnet', devnet: 'devnet' };
      const result = exportedForTesting.getAddresses(source, addresses);
      expect(result).toEqual('devnet');
    });
  });
});

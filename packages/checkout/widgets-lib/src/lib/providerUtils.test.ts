import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { isMetaMask, isPassport } from './providerUtils';

describe('providerUtils', () => {
  const mockPassportWeb3Provider = { provider: { isPassport: true } as ExternalProvider } as Web3Provider;
  const mockMetaMaskWeb3Provider = { provider: { isMetaMask: true } as ExternalProvider } as Web3Provider;

  describe('isPassport', () => {
    it('should return true when provider is valid and passport flag is true', () => {
      const result = isPassport(mockPassportWeb3Provider);
      expect(result).toBeTruthy();
    });

    it('should return false when provider is valid and passport flag is missing', () => {
      const result = isPassport(mockMetaMaskWeb3Provider);
      expect(result).toBeFalsy();
    });
  });

  describe('isMetaMask', () => {
    it('should return true when provider is valid and metamask flag is true', () => {
      const result = isMetaMask(mockMetaMaskWeb3Provider);
      expect(result).toBeTruthy();
    });

    it('should return false when provider is valid and metamask flag is missing', () => {
      const result = isMetaMask(mockPassportWeb3Provider);
      expect(result).toBeFalsy();
    });
  });
});

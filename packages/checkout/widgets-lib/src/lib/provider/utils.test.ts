import { BrowserProvider } from 'ethers';
import { isMetaMaskProvider, isPassportProvider } from './utils';

describe('providerUtils', () => {
  const mockPassportBrowserProvider = { provider: { isPassport: true } } as unknown as BrowserProvider;
  const mockMetaMaskBrowserProvider = { provider: { isMetaMask: true } } as unknown as BrowserProvider;

  describe('isPassport', () => {
    it('should return true when provider is valid and passport flag is true', () => {
      const result = isPassportProvider(mockPassportBrowserProvider);
      expect(result).toBe(true);
    });

    it('should return false when provider is valid and passport flag is missing', () => {
      const result = isPassportProvider(mockMetaMaskBrowserProvider);
      expect(result).toBe(false);
    });

    it('should return false when provider is undefined ', () => {
      const result = isPassportProvider(undefined);
      expect(result).toBe(false);
    });

    it('should return false when provider is null ', () => {
      const result = isPassportProvider(undefined);
      expect(result).toBe(false);
    });
  });

  describe('isMetaMask', () => {
    it('should return true when provider is valid and metamask flag is true', () => {
      const result = isMetaMaskProvider(mockMetaMaskBrowserProvider);
      expect(result).toBe(true);
    });

    it('should return false when provider is valid and metamask flag is missing', () => {
      const result = isMetaMaskProvider(mockPassportBrowserProvider);
      expect(result).toBe(false);
    });

    it('should return false when provider is undefined ', () => {
      const result = isMetaMaskProvider(undefined);
      expect(result).toBe(false);
    });

    it('should return false when provider is null ', () => {
      const result = isMetaMaskProvider(undefined);
      expect(result).toBe(false);
    });
  });
});

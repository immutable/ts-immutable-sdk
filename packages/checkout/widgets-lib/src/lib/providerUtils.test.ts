import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import { createAndConnectToProvider, isMetaMaskProvider, isPassportProvider } from './providerUtils';

describe('providerUtils', () => {
  const mockPassportWeb3Provider = { provider: { isPassport: true } as ExternalProvider } as Web3Provider;
  const mockMetaMaskWeb3Provider = { provider: { isMetaMask: true } as ExternalProvider } as Web3Provider;

  describe('isPassport', () => {
    it('should return true when provider is valid and passport flag is true', () => {
      const result = isPassportProvider(mockPassportWeb3Provider);
      expect(result).toBe(true);
    });

    it('should return false when provider is valid and passport flag is missing', () => {
      const result = isPassportProvider(mockMetaMaskWeb3Provider);
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
      const result = isMetaMaskProvider(mockMetaMaskWeb3Provider);
      expect(result).toBe(true);
    });

    it('should return false when provider is valid and metamask flag is missing', () => {
      const result = isMetaMaskProvider(mockPassportWeb3Provider);
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

  describe('createAndConnectToProvider', () => {
    const mockWeb3Modal = {} as any;
    it('should return provider', () => {
      const mockCheckout = {
        createProvider: jest.fn().mockResolvedValue({ provider: mockPassportWeb3Provider }),
        checkIsWalletConnected: jest.fn().mockResolvedValue({ isConnected: true }),
        connect: jest.fn().mockResolvedValue({ provider: mockPassportWeb3Provider }),
      } as unknown as Checkout;

      const result = createAndConnectToProvider(mockCheckout, WalletProviderName.PASSPORT, mockWeb3Modal);
      expect(result).resolves.toBe(mockPassportWeb3Provider);
    });

    it('should throw error when createProvider fails', () => {
      const mockCheckout = {
        createProvider: jest.fn().mockRejectedValue(new Error('Failed to create provider')),
      } as unknown as Checkout;
      const result = createAndConnectToProvider(mockCheckout, WalletProviderName.PASSPORT, mockWeb3Modal);
      expect(result).rejects.toThrowError('Failed to create provider');
    });

    it('should throw error when checkIsWalletConnected fails', () => {
      const mockCheckout = {
        createProvider: jest.fn().mockResolvedValue({ provider: mockPassportWeb3Provider }),
        checkIsWalletConnected: jest.fn().mockRejectedValue(new Error('Failed to checkIsWalletConnected')),
      } as unknown as Checkout;
      const result = createAndConnectToProvider(mockCheckout, WalletProviderName.PASSPORT, mockWeb3Modal);
      expect(result).rejects.toThrowError('Failed to checkIsWalletConnected');
    });

    it('should throw error when connect fails', () => {
      const mockCheckout = {
        createProvider: jest.fn().mockResolvedValue({ provider: mockPassportWeb3Provider }),
        checkIsWalletConnected: jest.fn().mockResolvedValue({ isConnected: false }),
        connect: jest.fn().mockRejectedValue(new Error('Failed to connect')),
      } as unknown as Checkout;
      const result = createAndConnectToProvider(mockCheckout, WalletProviderName.PASSPORT, mockWeb3Modal);
      expect(result).rejects.toThrowError('Failed to connect');
    });
  });
});

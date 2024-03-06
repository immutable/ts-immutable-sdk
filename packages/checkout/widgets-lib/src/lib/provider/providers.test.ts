import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import { createAndConnectToProvider } from './providers';

describe('providerUtils', () => {
  const mockPassportWeb3Provider = { provider: { isPassport: true } as ExternalProvider } as Web3Provider;

  describe('createAndConnectToProvider', () => {
    it('should return provider', () => {
      const mockCheckout = {
        createProvider: jest.fn().mockResolvedValue({ provider: mockPassportWeb3Provider }),
        checkIsWalletConnected: jest.fn().mockResolvedValue({ isConnected: true }),
        connect: jest.fn().mockResolvedValue({ provider: mockPassportWeb3Provider }),
      } as unknown as Checkout;
      const result = createAndConnectToProvider(mockCheckout, WalletProviderName.PASSPORT);
      expect(result).resolves.toBe(mockPassportWeb3Provider);
    });

    it('should throw error when createProvider fails', () => {
      const mockCheckout = {
        createProvider: jest.fn().mockRejectedValue(new Error('Failed to create provider')),
      } as unknown as Checkout;
      const result = createAndConnectToProvider(mockCheckout, WalletProviderName.PASSPORT);
      expect(result).rejects.toThrowError('Failed to create provider');
    });

    it('should throw error when checkIsWalletConnected fails', () => {
      const mockCheckout = {
        createProvider: jest.fn().mockResolvedValue({ provider: mockPassportWeb3Provider }),
        checkIsWalletConnected: jest.fn().mockRejectedValue(new Error('Failed to checkIsWalletConnected')),
      } as unknown as Checkout;
      const result = createAndConnectToProvider(mockCheckout, WalletProviderName.PASSPORT);
      expect(result).rejects.toThrowError('Failed to checkIsWalletConnected');
    });

    it('should throw error when connect fails', () => {
      const mockCheckout = {
        createProvider: jest.fn().mockResolvedValue({ provider: mockPassportWeb3Provider }),
        checkIsWalletConnected: jest.fn().mockResolvedValue({ isConnected: false }),
        connect: jest.fn().mockRejectedValue(new Error('Failed to connect')),
      } as unknown as Checkout;
      const result = createAndConnectToProvider(mockCheckout, WalletProviderName.PASSPORT);
      expect(result).rejects.toThrowError('Failed to connect');
    });
  });
});

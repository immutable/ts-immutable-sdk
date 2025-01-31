import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider';
import { OpenIdExtension } from '@magic-ext/oidc';
import { ethers } from 'ethers';
import { MagicProviderProxyFactory } from './magicProviderProxyFactory';
import AuthManager from './authManager';
import { PassportConfiguration } from './config';

describe('MagicProviderProxyFactory', () => {
  let mockAuthManager: jest.Mocked<AuthManager>;
  let mockMagicClient: jest.Mocked<InstanceWithExtensions<SDKBase, [OpenIdExtension]>>;
  let mockRpcProvider: jest.Mocked<ethers.providers.ExternalProvider>;
  let config: PassportConfiguration;
  let factory: MagicProviderProxyFactory;

  beforeEach(() => {
    // Setup mocks
    mockAuthManager = {
      getUser: jest.fn(),
    } as any;

    mockRpcProvider = {
      request: jest.fn(),
    } as any;

    mockMagicClient = {
      rpcProvider: mockRpcProvider,
      user: {
        isLoggedIn: jest.fn(),
      },
      openid: {
        loginWithOIDC: jest.fn(),
      },
    } as any;

    config = {
      magicProviderId: 'test-provider-id',
    } as PassportConfiguration;

    factory = new MagicProviderProxyFactory(mockAuthManager, config);
  });

  describe('createProxy', () => {
    it('should pass through non-personal_sign requests unchanged', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      const args = { method: 'eth_accounts' };

      await proxy.request!(args);

      expect(mockRpcProvider.request).toHaveBeenCalledWith(args);
      expect(mockMagicClient.user.isLoggedIn).not.toHaveBeenCalled();
    });

    it('should check login status for personal_sign requests', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      const args = { method: 'personal_sign', params: ['message', 'address'] };

      (mockMagicClient.user.isLoggedIn as jest.Mock).mockResolvedValue(true);

      await proxy.request!(args);

      expect(mockMagicClient.user.isLoggedIn).toHaveBeenCalled();
      expect(mockRpcProvider.request).toHaveBeenCalledWith(args);
    });

    it('should re-authenticate if user is not logged in', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      const args = { method: 'personal_sign', params: ['message', 'address'] };
      const mockIdToken = 'mock-id-token';

      (mockMagicClient.user.isLoggedIn as jest.Mock).mockResolvedValue(false);
      (mockAuthManager.getUser as jest.Mock).mockResolvedValue({ idToken: mockIdToken });

      await proxy.request!(args);

      expect(mockMagicClient.openid.loginWithOIDC).toHaveBeenCalledWith({
        jwt: mockIdToken,
        providerId: config.magicProviderId,
      });
      expect(mockRpcProvider.request).toHaveBeenCalledWith(args);
    });

    it('should throw error if re-authentication fails due to missing ID token', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      const args = { method: 'personal_sign', params: ['message', 'address'] };

      (mockMagicClient.user.isLoggedIn as jest.Mock).mockResolvedValue(false);
      (mockAuthManager.getUser as jest.Mock).mockResolvedValue(null);

      await expect(proxy.request!(args)).rejects.toThrow('ProviderProxy: failed to obtain ID token');
    });

    it('should wrap errors with ProviderProxy prefix', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      const args = { method: 'personal_sign', params: ['message', 'address'] };

      (mockMagicClient.user.isLoggedIn as jest.Mock).mockRejectedValue(new Error('Test error'));

      await expect(proxy.request!(args)).rejects.toThrow('ProviderProxy: Test error');
    });
  });
});

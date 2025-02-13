import { Eip1193Provider } from 'ethers';
import { MagicProviderProxyFactory } from './magicProviderProxyFactory';
import AuthManager from '../authManager';
import { PassportConfiguration } from '../config';
import { MagicClient } from './types';

describe('MagicProviderProxyFactory', () => {
  let mockAuthManager: jest.Mocked<AuthManager>;
  let mockConfig: PassportConfiguration;
  let mockMagicClient: jest.Mocked<MagicClient>;
  let mockRpcProvider: jest.Mocked<Eip1193Provider>;
  let factory: MagicProviderProxyFactory;

  beforeEach(() => {
    mockAuthManager = {
      getUser: jest.fn(),
    } as any;

    mockConfig = {
      magicProviderId: 'test-provider-id',
    } as PassportConfiguration;

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

    factory = new MagicProviderProxyFactory(mockAuthManager, mockConfig);
  });

  describe('createProxy', () => {
    it('should create a proxy that passes through non-authenticated requests', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      const params = { method: 'eth_blockNumber' };

      await proxy.request!(params);

      expect(mockRpcProvider.request).toHaveBeenCalledWith(params);
      expect(mockMagicClient.user.isLoggedIn).not.toHaveBeenCalled();
    });

    it('should check authentication for personal_sign requests', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      const params = { method: 'personal_sign', params: ['message', 'address'] };
      (mockMagicClient.user.isLoggedIn as jest.Mock).mockResolvedValue(true);

      await proxy.request!(params);

      expect(mockMagicClient.user.isLoggedIn).toHaveBeenCalled();
      expect(mockRpcProvider.request).toHaveBeenCalledWith(params);
    });

    it('should check authentication for eth_accounts requests', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      const params = { method: 'eth_accounts' };
      (mockMagicClient.user.isLoggedIn as jest.Mock).mockResolvedValue(true);

      await proxy.request!(params);

      expect(mockMagicClient.user.isLoggedIn).toHaveBeenCalled();
      expect(mockRpcProvider.request).toHaveBeenCalledWith(params);
    });

    it('should re-authenticate when user is not logged in', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      const params = { method: 'personal_sign', params: ['message', 'address'] };
      const mockIdToken = 'mock-id-token';

      (mockMagicClient.user.isLoggedIn as jest.Mock).mockResolvedValue(false);
      (mockAuthManager.getUser as jest.Mock).mockResolvedValue({ idToken: mockIdToken });

      await proxy.request!(params);

      expect(mockMagicClient.user.isLoggedIn).toHaveBeenCalled();
      expect(mockAuthManager.getUser).toHaveBeenCalled();
      expect(mockMagicClient.openid.loginWithOIDC).toHaveBeenCalledWith({
        jwt: mockIdToken,
        providerId: mockConfig.magicProviderId,
      });
      expect(mockRpcProvider.request).toHaveBeenCalledWith(params);
    });

    it('should throw error when re-authentication fails due to missing ID token', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      const params = { method: 'personal_sign', params: ['message', 'address'] };

      (mockMagicClient.user.isLoggedIn as jest.Mock).mockResolvedValue(false);
      (mockAuthManager.getUser as jest.Mock).mockResolvedValue(null);

      await expect(proxy.request!(params)).rejects.toThrow('ProviderProxy: failed to obtain ID token');
    });

    it('should wrap errors with ProviderProxy prefix', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      const params = { method: 'personal_sign', params: ['message', 'address'] };

      (mockMagicClient.user.isLoggedIn as jest.Mock).mockRejectedValue(new Error('Test error'));

      await expect(proxy.request!(params)).rejects.toThrow('ProviderProxy: Test error');
    });
  });
});

import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider';
import { OpenIdExtension } from '@magic-ext/oidc';
import { ethers } from 'ethers';
import { MagicProviderProxyFactory } from './magicProviderProxyFactory';
import AuthManager from '../authManager';
import { PassportConfiguration } from '../config';

describe('MagicProviderProxyFactory', () => {
  let mockAuthManager: jest.Mocked<AuthManager>;
  let mockMagicClient: jest.Mocked<InstanceWithExtensions<SDKBase, [OpenIdExtension]>>;
  let mockRpcProvider: jest.Mocked<ethers.providers.ExternalProvider>;
  let config: PassportConfiguration;
  let factory: MagicProviderProxyFactory;

  beforeEach(() => {
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

    factory = new MagicProviderProxyFactory(mockAuthManager as AuthManager, config);
  });

  describe('createProxy', () => {
    it('should pass through non-authenticated requests', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      const expectedResult = { success: true };
      (mockRpcProvider.request as jest.Mock).mockResolvedValue(expectedResult);

      const result = await proxy.request!({
        method: 'eth_blockNumber',
      });

      expect(result).toBe(expectedResult);
      expect(mockMagicClient.user.isLoggedIn).not.toHaveBeenCalled();
    });

    it('should check authentication for personal_sign requests', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      (mockMagicClient.user.isLoggedIn as jest.Mock).mockResolvedValue(true);
      const expectedResult = { success: true };
      (mockRpcProvider.request as jest.Mock).mockResolvedValue(expectedResult);

      const result = await proxy.request!({
        method: 'personal_sign',
        params: ['message', 'address'],
      });

      expect(result).toBe(expectedResult);
      expect(mockMagicClient.user.isLoggedIn).toHaveBeenCalled();
    });

    it('should re-authenticate if user is not logged in', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      (mockMagicClient.user.isLoggedIn as jest.Mock).mockResolvedValue(false);
      (mockAuthManager.getUser as jest.Mock).mockResolvedValue({ idToken: 'test-token' });
      const expectedResult = { success: true };
      (mockRpcProvider.request as jest.Mock).mockResolvedValue(expectedResult);

      const result = await proxy.request!({
        method: 'eth_accounts',
      });

      expect(result).toBe(expectedResult);
      expect(mockMagicClient.user.isLoggedIn).toHaveBeenCalled();
      expect(mockAuthManager.getUser).toHaveBeenCalled();
      expect(mockMagicClient.openid.loginWithOIDC).toHaveBeenCalledWith({
        jwt: 'test-token',
        providerId: 'test-provider-id',
      });
    });

    it('should throw error if unable to obtain ID token during re-authentication', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      (mockMagicClient.user.isLoggedIn as jest.Mock).mockResolvedValue(false);
      (mockAuthManager.getUser as jest.Mock).mockResolvedValue({ idToken: null });

      await expect(proxy.request!({
        method: 'personal_sign',
        params: ['message', 'address'],
      })).rejects.toThrow('ProviderProxy: failed to obtain ID token');
    });

    it('should wrap errors with ProviderProxy prefix', async () => {
      const proxy = factory.createProxy(mockMagicClient);
      (mockMagicClient.user.isLoggedIn as jest.Mock).mockRejectedValue(new Error('test error'));

      await expect(proxy.request!({
        method: 'personal_sign',
        params: ['message', 'address'],
      })).rejects.toThrow('ProviderProxy: test error');
    });
  });
});

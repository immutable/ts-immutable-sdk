import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider';
import { OpenIdExtension } from '@magic-ext/oidc';
import { ethers } from 'ethers';
import AuthManager from './authManager';
import { PassportConfiguration } from './config';

type MagicClient = InstanceWithExtensions<SDKBase, [OpenIdExtension]>;

/**
 * Factory class for creating proxied Magic providers that handle automatic re-authentication.
 * This proxy wraps the Magic RPC provider to intercept certain RPC methods (currently just personal_sign)
 * and ensures the user is properly authenticated before executing them.
 */

export class MagicProviderProxyFactory {
  private authManager: AuthManager;

  private config: PassportConfiguration;

  constructor(authManager: AuthManager, config: PassportConfiguration) {
    this.authManager = authManager;
    this.config = config;
  }

  createProxy(magicClient: MagicClient): ethers.providers.ExternalProvider {
    const magicRpcProvider = magicClient.rpcProvider as unknown as ethers.providers.ExternalProvider;

    const proxyHandler: ProxyHandler<ethers.providers.ExternalProvider> = {
      get: (target: ethers.providers.ExternalProvider, property: string, receiver: any) => {
        // TODO: What happens if no args are passed to request, or additional params?
        // We should dynamically get the args, use optional chaining to check the method, and then use the dynamic args to call the original request method
        if (property === 'request') {
          return async (args: { method: string; params?: any[] }) => {
            try {
              if (args.method === 'personal_sign') {
                const isUserLoggedIn = await magicClient.user.isLoggedIn();
                if (!isUserLoggedIn) {
                  const user = await this.authManager.getUser();
                  const idToken = user?.idToken;
                  if (!idToken) {
                    throw new Error('failed to obtain ID token');
                  }
                  await magicClient.openid.loginWithOIDC({
                    jwt: idToken,
                    providerId: this.config.magicProviderId,
                  });
                }
              }

              return target.request!(args);
            } catch (error: unknown) {
              if (error instanceof Error) {
                throw new Error(`ProviderProxy: ${error.message}`);
              }
              throw new Error(`ProviderProxy: ${error}`);
            }
          };
        }

        return Reflect.get(target, property, receiver);
      },
    };

    return new Proxy(magicRpcProvider, proxyHandler);
  }
}

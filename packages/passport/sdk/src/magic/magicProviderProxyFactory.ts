import { Eip1193Provider } from 'ethers';
import AuthManager from '../authManager';
import { PassportConfiguration } from '../config';
import { MagicClient } from './types';

const shouldCheckMagicSession = (args: any[]): boolean => (
  args?.length > 0
  && typeof args[0] === 'object'
    && 'method' in args[0]
    && typeof args[0].method === 'string'
    && ['personal_sign', 'eth_accounts'].includes(args[0].method)
);

/**
 * Factory class for creating a Magic provider that automatically handles re-authentication.
 * This proxy wraps the Magic RPC provider to intercept certain RPC methods (`personal_sign`, `eth_accounts`)
 * and ensures the user is properly authenticated before executing them.
 */
export class MagicProviderProxyFactory {
  private authManager: AuthManager;

  private config: PassportConfiguration;

  constructor(authManager: AuthManager, config: PassportConfiguration) {
    this.authManager = authManager;
    this.config = config;
  }

  createProxy(magicClient: MagicClient): Eip1193Provider {
    const magicRpcProvider = magicClient.rpcProvider as unknown as Eip1193Provider;

    const proxyHandler: ProxyHandler<Eip1193Provider> = {
      get: (target: Eip1193Provider, property: string, receiver: any) => {
        if (property === 'request') {
          return async (...args: any[]) => {
            try {
              if (shouldCheckMagicSession(args)) {
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

              // @ts-ignore - Invoke the request method with the provided arguments
              return target.request!(...args);
            } catch (error: unknown) {
              if (error instanceof Error) {
                throw new Error(`ProviderProxy: ${error.message}`);
              }
              throw new Error(`ProviderProxy: ${error}`);
            }
          };
        }

        // Return the property from the target
        return Reflect.get(target, property, receiver);
      },
    };

    return new Proxy(magicRpcProvider, proxyHandler);
  }
}

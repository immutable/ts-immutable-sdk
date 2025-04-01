import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import { Flow, trackDuration } from '@imtbl/metrics';
import { Eip1193Provider } from 'ethers';
import { PassportErrorType, withPassportError } from '../errors/passportError';
import { PassportConfiguration } from '../config';
import { withMetricsAsync } from '../utils/metrics';
import { MagicProviderProxyFactory } from './magicProviderProxyFactory';
import { MagicClient } from './types';

const MAINNET = 'mainnet';

export default class MagicAdapter {
  private readonly config: PassportConfiguration;

  private readonly magicProviderProxyFactory: MagicProviderProxyFactory;

  private readonly magicClient?: MagicClient;

  constructor(config: PassportConfiguration, magicProviderProxyFactory: MagicProviderProxyFactory) {
    this.config = config;
    this.magicProviderProxyFactory = magicProviderProxyFactory;

    if (typeof window !== 'undefined') {
      this.magicClient = new Magic(this.config.magicPublishableApiKey, {
        extensions: [new OpenIdExtension()],
        network: MAINNET, // We always connect to mainnet to ensure addresses are the same across envs
      });
    }
  }

  private getMagicClient(): MagicClient {
    if (!this.magicClient) {
      throw new Error('Cannot perform this action outside of the browser');
    }

    return this.magicClient;
  }

  async login(
    idToken: string,
  ): Promise<Eip1193Provider> {
    return withPassportError<Eip1193Provider>(async () => (
      withMetricsAsync(async (flow: Flow) => {
        const startTime = performance.now();

        const magicClient = this.getMagicClient();
        flow.addEvent('endMagicClientInit');

        await magicClient.openid.loginWithOIDC({
          jwt: idToken,
          providerId: this.config.magicProviderId,
        });
        flow.addEvent('endLoginWithOIDC');

        trackDuration(
          'passport',
          flow.details.flowName,
          Math.round(performance.now() - startTime),
        );

        return this.magicProviderProxyFactory.createProxy(magicClient);
      }, 'magicLogin')
    ), PassportErrorType.WALLET_CONNECTION_ERROR);
  }

  async logout() {
    const magicClient = this.getMagicClient();
    if (magicClient.user) {
      await magicClient.user.logout();
    }
  }
}

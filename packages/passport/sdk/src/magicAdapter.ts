import { SDKBase, InstanceWithExtensions } from '@magic-sdk/provider';
import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import { ExternalProvider } from '@ethersproject/providers';
import { PassportConfiguration } from './config';
import BackgroundTask from './network/backgroundTask';

export default class MagicAdapter {
  private readonly config: PassportConfiguration;

  private magicClient?: InstanceWithExtensions<SDKBase, [OpenIdExtension]>;

  private loginTask?: BackgroundTask<ExternalProvider>;

  constructor(config: PassportConfiguration) {
    this.config = config;
  }

  public get magicProvider(): Promise<ExternalProvider> {
    if (!this.loginTask) {
      throw new Error('Login must be called first');
    }

    return this.loginTask.result;
  }

  async login(
    idToken: string,
  ) {
    this.magicClient = new Magic(this.config.magicPublishableApiKey, {
      extensions: [new OpenIdExtension()],
      network: this.config.network,
    });

    this.loginTask = new BackgroundTask<ExternalProvider>(async () => {
      if (!this.magicClient) {
        throw new Error('Magic client not initialized');
      }
      await this.magicClient.openid.loginWithOIDC({
        jwt: idToken,
        providerId: this.config.magicProviderId,
      });

      return this.magicClient.rpcProvider as unknown as ExternalProvider;
    });
  }

  async logout() {
    if (this.magicClient?.user) {
      await this.magicClient.user.logout();
    }
  }
}

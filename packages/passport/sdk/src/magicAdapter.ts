import { SDKBase, InstanceWithExtensions } from '@magic-sdk/provider';
import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import { ethers } from 'ethers';
import { PassportErrorType, withPassportError } from './errors/passportError';
import { PassportConfiguration } from './config';

export default class MagicAdapter {
  private readonly config: PassportConfiguration;

  private magicClient?: InstanceWithExtensions<SDKBase, [OpenIdExtension]>;

  constructor(config: PassportConfiguration) {
    this.config = config;
    if (typeof window !== 'undefined') {
      this.magicClient = this.initMagicClient();
      this.magicClient.preload();
    }
  }

  async login(
    idToken: string,
  ): Promise<ethers.providers.ExternalProvider> {
    return withPassportError<ethers.providers.ExternalProvider>(async () => {
      if (!this.magicClient) {
        this.magicClient = this.initMagicClient();
      }
      await this.magicClient.openid.loginWithOIDC({
        jwt: idToken,
        providerId: this.config.magicProviderId,
      });

      return this.magicClient.rpcProvider as unknown as ethers.providers.ExternalProvider;
    }, PassportErrorType.WALLET_CONNECTION_ERROR);
  }

  async logout() {
    if (this.magicClient?.user) {
      await this.magicClient.user.logout();
    }
  }

  initMagicClient() {
    return new Magic(this.config.magicPublishableApiKey, {
      extensions: [new OpenIdExtension()],
      network: this.config.network,
    });
  }
}

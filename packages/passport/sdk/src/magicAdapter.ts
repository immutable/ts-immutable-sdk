import { SDKBase, InstanceWithExtensions } from '@magic-sdk/provider';
import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import { ethers } from 'ethers';
import { PassportErrorType, withPassportError } from './errors/passportError';
import { PassportConfiguration } from './config';
import { Networks } from './types';

export default class MagicAdapter {
  private readonly config: PassportConfiguration;

  private magicClient?: InstanceWithExtensions<SDKBase, [OpenIdExtension]>;

  constructor(config: PassportConfiguration) {
    this.config = config;
  }

  async login(
    idToken: string,
    network: Networks,
  ): Promise<ethers.providers.ExternalProvider> {
    return withPassportError<ethers.providers.ExternalProvider>(async () => {
      this.magicClient = new Magic(this.config.magicPublishableApiKey, {
        extensions: [new OpenIdExtension()],
        network,
      });
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
}

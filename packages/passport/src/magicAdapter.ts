import { EthNetworkConfiguration, Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import { ethers } from 'ethers';
import { PassportErrorType, withPassportError } from './errors/passportError';
import { PassportConfiguration } from './config';

export default class MagicAdapter {
  private readonly config: PassportConfiguration;

  constructor(config: PassportConfiguration) {
    this.config = config;
  }

  async login(
    idToken: string,
    network: EthNetworkConfiguration,
  ): Promise<ethers.providers.ExternalProvider> {
    return withPassportError<ethers.providers.ExternalProvider>(async () => {
      const magicClient = new Magic(this.config.magicPublishableApiKey, {
        extensions: [new OpenIdExtension()],
        network,
      });
      await magicClient.openid.loginWithOIDC({
        jwt: idToken,
        providerId: this.config.magicProviderId,
      });

      return magicClient.rpcProvider as unknown as ethers.providers.ExternalProvider;
    }, PassportErrorType.WALLET_CONNECTION_ERROR);
  }
}

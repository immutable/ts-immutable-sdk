import { ethers } from 'ethers';
import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import { PassportErrorType, withPassportError } from './errors/passportError';
import { PassportConfiguration } from './config/config';

export default class MagicAdapter {
  private readonly magicClient;
  private readonly config: PassportConfiguration;

  constructor(config: PassportConfiguration) {
    this.config = config;
    this.magicClient = new Magic(config.magicPublishableApiKey, {
      network: config.network,
      extensions: [
        new OpenIdExtension(),
      ]
    });
  }

  async login(idToken: string): Promise<ethers.providers.Web3Provider> {
    return withPassportError<ethers.providers.Web3Provider>(async () => {
      await this.magicClient.openid.loginWithOIDC({
        jwt: idToken,
        providerId: this.config.magicProviderId,
      });
      return new ethers.providers.Web3Provider(
        this.magicClient.rpcProvider as unknown as ethers.providers.ExternalProvider
      );
    }, {
      type: PassportErrorType.WALLET_CONNECTION_ERROR,
    })
  }
}

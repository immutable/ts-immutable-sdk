import { ethers } from 'ethers';
import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import { Networks } from './types';
import { PassportErrorType, withPassportError } from './errors/passportError';

// TODO: The apiKey & providerId are static properties that could come from env or config file
const magicApiKey = 'pk_live_4058236363130CA9';
const magicProviderId = 'C9odf7hU4EQ5EufcfgYfcBaT5V6LhocXyiPRhIjw2EY=';

export default class MagicAdapter {
  private readonly magicClient;

  constructor(network: Networks = 'goerli') {
    this.magicClient = new Magic(magicApiKey, {
      network,
      extensions: [new OpenIdExtension()],
    });
  }

  async login(idToken: string): Promise<ethers.providers.Web3Provider> {
    return withPassportError<ethers.providers.Web3Provider>(async () => {
      await this.magicClient.openid.loginWithOIDC({
        jwt: idToken,
        providerId: magicProviderId,
      });
      return new ethers.providers.Web3Provider(
        this.magicClient
          .rpcProvider as unknown as ethers.providers.ExternalProvider
      );
    }, PassportErrorType.WALLET_CONNECTION_ERROR);
  }
}

import { ethers } from 'ethers';
import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import { Networks } from './types';
import { PassportErrorType, withPassportError } from './errors/passportError';

// TODO: The apiKey & providerId are static properties that could come from env or config file
const magicApiKey = 'pk_live_A7D9211D7547A338';
const magicProviderId = 'mPGZAvZsFkyfT6OWfML1HgTKjPqYOPkhhOj-8qCGeqI=';

export default class MagicAdapter {
  private readonly magicClient;

  constructor(network: Networks = 'mainnet') {
    this.magicClient = new Magic(magicApiKey, {
      network,
      extensions: [
        new OpenIdExtension(),
      ]
    });
  }

  async login(idToken: string): Promise<ethers.providers.Web3Provider> {
    return withPassportError<ethers.providers.Web3Provider>(async () => {
      await this.magicClient.openid.loginWithOIDC({
        jwt: idToken,
        providerId: magicProviderId,
      });
      return new ethers.providers.Web3Provider(this.magicClient.rpcProvider as any);
    }, {
      type: PassportErrorType.WALLET_CONNECTION_ERROR,
    })
  }
}

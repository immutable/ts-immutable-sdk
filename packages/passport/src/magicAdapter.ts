import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import { ethers } from 'ethers';
import { PassportErrorType, withPassportError } from './errors/passportError';
import { PassportConfiguration } from './config';

export default class MagicAdapter {
  private readonly magicClient;

  private readonly config: PassportConfiguration;

  constructor(config: PassportConfiguration) {
    this.config = config;
    this.magicClient = new Magic(config.magicPublishableApiKey, {
      extensions: [new OpenIdExtension()],
      network: config.network,
      // network: {
      // TODO: Figure out network
      //   rpcUrl: '',
      //   chainId: 5,
      //   chainType: EthChainType.Harmony,
      // },
    });
  }

  async login(idToken: string): Promise<ethers.providers.ExternalProvider> {
    return withPassportError<ethers.providers.ExternalProvider>(async () => {
      await this.magicClient.openid.loginWithOIDC({
        jwt: idToken,
        providerId: this.config.magicProviderId,
      });

      return this.magicClient.rpcProvider as unknown as ethers.providers.ExternalProvider;
    }, PassportErrorType.WALLET_CONNECTION_ERROR);
  }
}

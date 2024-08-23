import { SDKBase, InstanceWithExtensions } from '@magic-sdk/provider';
import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import { ethers } from 'ethers';
import { trackDuration } from '@imtbl/metrics';
import { PassportErrorType, withPassportError } from './errors/passportError';
import { PassportConfiguration } from './config';

type MagicClient = InstanceWithExtensions<SDKBase, [OpenIdExtension]>;

const MAINNET = 'mainnet';

export default class MagicAdapter {
  private readonly config: PassportConfiguration;

  private readonly magicClient: MagicClient;

  constructor(config: PassportConfiguration) {
    this.config = config;
    this.magicClient = new Magic(this.config.magicPublishableApiKey, {
      extensions: [new OpenIdExtension()],
      network: MAINNET, // We always connect to mainnet to ensure addresses are the same across envs
    });
  }

  async login(
    idToken: string,
  ): Promise<ethers.providers.ExternalProvider> {
    return withPassportError<ethers.providers.ExternalProvider>(async () => {
      const startTime = performance.now();

      await this.magicClient.openid.loginWithOIDC({
        jwt: idToken,
        providerId: this.config.magicProviderId,
      });

      trackDuration(
        'passport',
        'magicLogin',
        Math.round(performance.now() - startTime),
      );

      return this.magicClient.rpcProvider as unknown as ethers.providers.ExternalProvider;
    }, PassportErrorType.WALLET_CONNECTION_ERROR);
  }

  async logout() {
    if (this.magicClient.user) {
      await this.magicClient.user.logout();
    }
  }
}

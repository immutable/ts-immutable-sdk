import { EthSigner, StarkSigner } from '@imtbl/core-sdk';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import { Web3Provider } from '@ethersproject/providers';
import registerPassportStarkEx from './workflows/registration';
import { retryWithDelay } from './retry';
import { PassportError, PassportErrorType, withPassportError } from '../errors/passportError';
import { PassportConfiguration } from '../config';
import AuthManager from '../authManager';
import { ConfirmationScreen } from '../confirmation';
import MagicAdapter from '../magicAdapter';
import { User, UserWithEtherKey } from '../types';
import { PassportImxProvider } from './passportImxProvider';
import { getStarkSigner } from './getStarkSigner';

export type PassportImxProviderFactoryInput = {
  authManager: AuthManager;
  config: PassportConfiguration;
  confirmationScreen: ConfirmationScreen;
  immutableXClient: ImmutableXClient;
  magicAdapter: MagicAdapter;
};

export class PassportImxProviderFactory {
  private readonly authManager: AuthManager;

  private readonly config: PassportConfiguration;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly immutableXClient: ImmutableXClient;

  private readonly magicAdapter: MagicAdapter;

  constructor({
    authManager,
    config,
    confirmationScreen,
    immutableXClient,
    magicAdapter,
  }: PassportImxProviderFactoryInput) {
    this.authManager = authManager;
    this.config = config;
    this.confirmationScreen = confirmationScreen;
    this.immutableXClient = immutableXClient;
    this.magicAdapter = magicAdapter;
  }

  public async getPassportImxProvider(connectSilent: boolean = false): Promise<PassportImxProvider | null> {
    let user: User | null;
    if (connectSilent) {
      user = await this.authManager.loginSilent();
      if (!user) {
        return null;
      }
    } else {
      user = await this.authManager.login();
    }

    if (!user.idToken) {
      throw new PassportError(
        'Failed to initialise',
        PassportErrorType.WALLET_CONNECTION_ERROR,
      );
    }

    const magicRpcProvider = await this.magicAdapter.login(user.idToken, this.config.network);
    const web3Provider = new Web3Provider(
      magicRpcProvider,
    );
    const ethSigner = web3Provider.getSigner();
    const starkSigner = await getStarkSigner(ethSigner);

    if (!user.etherKey) {
      user = await this.registerStarkEx(ethSigner, starkSigner, user.accessToken);
    }

    return new PassportImxProvider({
      user: user as UserWithEtherKey,
      starkSigner,
      immutableXClient: this.immutableXClient,
      imxPublicApiDomain: this.config.imxPublicApiDomain,
      confirmationScreen: this.confirmationScreen,
    });
  }

  private async registerStarkEx(userAdminKeySigner: EthSigner, starkSigner: StarkSigner, jwt: string) {
    return withPassportError<UserWithEtherKey | null>(async () => {
      await registerPassportStarkEx(
        {
          ethSigner: userAdminKeySigner,
          starkSigner,
          usersApi: this.immutableXClient.usersApi,
        },
        jwt,
      );

      // User metadata is updated asynchronously. Poll userinfo endpoint until it is updated.
      const updatedUser = await retryWithDelay<User | null>(async () => {
        const user = await this.authManager.loginSilent();
        const metadataExists = !!user?.etherKey && !!user?.starkKey && !!user?.userAdminKey;
        if (metadataExists) {
          return user;
        }
        return Promise.reject(new Error('user wallet addresses not exist'));
      });

      return updatedUser as UserWithEtherKey;
    }, PassportErrorType.REFRESH_TOKEN_ERROR);
  }
}

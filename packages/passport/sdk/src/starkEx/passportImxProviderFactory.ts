import { EthSigner, StarkSigner } from '@imtbl/core-sdk';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import { Web3Provider } from '@ethersproject/providers';
import registerPassportStarkEx from './workflows/registration';
import { retryWithDelay } from '../network/retry';
import { PassportError, PassportErrorType, withPassportError } from '../errors/passportError';
import { PassportConfiguration } from '../config';
import AuthManager from '../authManager';
import { ConfirmationScreen } from '../confirmation';
import MagicAdapter from '../magicAdapter';
import {
  DeviceTokenResponse, PassportEventMap, User, UserImx,
} from '../types';
import { PassportImxProvider } from './passportImxProvider';
import { getStarkSigner } from './getStarkSigner';
import TypedEventEmitter from '../typedEventEmitter';

export type PassportImxProviderFactoryInput = {
  authManager: AuthManager;
  config: PassportConfiguration;
  confirmationScreen: ConfirmationScreen;
  immutableXClient: ImmutableXClient;
  magicAdapter: MagicAdapter;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
};

export class PassportImxProviderFactory {
  private readonly authManager: AuthManager;

  private readonly config: PassportConfiguration;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly immutableXClient: ImmutableXClient;

  private readonly magicAdapter: MagicAdapter;

  private readonly passportEventEmitter: TypedEventEmitter<PassportEventMap>;

  constructor({
    authManager,
    config,
    confirmationScreen,
    immutableXClient,
    magicAdapter,
    passportEventEmitter,
  }: PassportImxProviderFactoryInput) {
    this.authManager = authManager;
    this.config = config;
    this.confirmationScreen = confirmationScreen;
    this.immutableXClient = immutableXClient;
    this.magicAdapter = magicAdapter;
    this.passportEventEmitter = passportEventEmitter;
  }

  public async getProvider(): Promise<PassportImxProvider> {
    const user = await this.authManager.login();
    return this.createProviderInstance(user);
  }

  public async getProviderSilent(): Promise<PassportImxProvider | null> {
    const user = await this.authManager.loginSilent();
    if (!user) {
      return null;
    }

    return this.createProviderInstance(user);
  }

  public async getProviderWithDeviceFlow(
    deviceCode: string,
    interval: number,
    timeoutMs?: number,
  ): Promise<PassportImxProvider> {
    const user = await this.authManager.connectImxDeviceFlow(deviceCode, interval, timeoutMs);
    return this.createProviderInstance(user);
  }

  public async getProviderWithPKCEFlow(authorizationCode: string, state: string): Promise<PassportImxProvider> {
    const user = await this.authManager.connectImxPKCEFlow(authorizationCode, state);
    return this.createProviderInstance(user);
  }

  public async getProviderWithCredentials(tokenResponse: DeviceTokenResponse): Promise<PassportImxProvider | null> {
    const user = await this.authManager.connectImxWithCredentials(tokenResponse);
    if (!user) {
      return null;
    }

    return this.createProviderInstance(user);
  }

  private async createProviderInstance(user: User): Promise<PassportImxProvider> {
    if (!user.idToken) {
      throw new PassportError(
        'Failed to initialise',
        PassportErrorType.WALLET_CONNECTION_ERROR,
      );
    }

    const magicRpcProvider = await this.magicAdapter.login(user.idToken);
    const web3Provider = new Web3Provider(
      magicRpcProvider,
    );
    const ethSigner = web3Provider.getSigner();
    const starkSigner = await getStarkSigner(ethSigner);

    if (!user.imx?.ethAddress) {
      const userImx = await this.registerStarkEx(ethSigner, starkSigner, user.accessToken);
      return new PassportImxProvider({
        user: userImx,
        starkSigner,
        immutableXClient: this.immutableXClient,
        confirmationScreen: this.confirmationScreen,
        config: this.config,
        passportEventEmitter: this.passportEventEmitter,
      });
    }

    return new PassportImxProvider({
      user: user as UserImx,
      starkSigner,
      immutableXClient: this.immutableXClient,
      confirmationScreen: this.confirmationScreen,
      config: this.config,
      passportEventEmitter: this.passportEventEmitter,
    });
  }

  private async registerStarkEx(userAdminKeySigner: EthSigner, starkSigner: StarkSigner, jwt: string) {
    return withPassportError<UserImx>(async () => {
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
        const user = await this.authManager.loginSilent({ forceRefresh: true }); // force refresh to get updated user info
        const metadataExists = !!user?.imx;
        if (metadataExists) {
          return user;
        }
        return Promise.reject(new Error('user wallet addresses not exist'));
      });

      return updatedUser as UserImx;
    }, PassportErrorType.REFRESH_TOKEN_ERROR);
  }
}

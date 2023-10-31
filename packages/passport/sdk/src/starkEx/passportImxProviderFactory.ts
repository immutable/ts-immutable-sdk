import { ImmutableXClient } from '@imtbl/immutablex-client';
import { Web3Provider } from '@ethersproject/providers';
import { IMXProvider } from '@imtbl/provider';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { PassportConfiguration } from '../config';
import AuthManager from '../authManager';
import { ConfirmationScreen } from '../confirmation';
import MagicAdapter from '../magicAdapter';
import {
  DeviceTokenResponse,
  PassportEventMap,
  User,
  IMXSigners,
} from '../types';
import { getStarkSigner } from './getStarkSigner';
import TypedEventEmitter from '../utils/typedEventEmitter';
import { LazyPassportImxProvider } from './LazyPassportImxProvider';

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

  public async getProvider(): Promise<IMXProvider> {
    let user = null;
    try {
      user = await this.authManager.loginSilent();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }
    if (!user) {
      user = await this.authManager.login();
    }
    return this.createProviderInstance(user);
  }

  public async getProviderSilent(): Promise<IMXProvider | null> {
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
  ): Promise<IMXProvider> {
    const user = await this.authManager.connectImxDeviceFlow(deviceCode, interval, timeoutMs);
    return this.createProviderInstance(user);
  }

  public async getProviderWithPKCEFlow(authorizationCode: string, state: string): Promise<IMXProvider> {
    const user = await this.authManager.connectImxPKCEFlow(authorizationCode, state);
    return this.createProviderInstance(user);
  }

  public async getProviderWithCredentials(tokenResponse: DeviceTokenResponse): Promise<IMXProvider | null> {
    const user = await this.authManager.connectImxWithCredentials(tokenResponse);
    if (!user) {
      return null;
    }

    return this.createProviderInstance(user);
  }

  private async createSingers(idToken: string): Promise<IMXSigners> {
    const magicRpcProvider = await this.magicAdapter.login(idToken);
    const web3Provider = new Web3Provider(magicRpcProvider);

    const ethSigner = web3Provider.getSigner();
    const starkSigner = await getStarkSigner(ethSigner);

    return { ethSigner, starkSigner };
  }

  private async createProviderInstance(user: User): Promise<IMXProvider> {
    if (!user.idToken) {
      throw new PassportError(
        'Failed to initialise',
        PassportErrorType.WALLET_CONNECTION_ERROR,
      );
    }

    return new LazyPassportImxProvider({
      config: this.config,
      authManager: this.authManager,
      immutableXClient: this.immutableXClient,
      confirmationScreen: this.confirmationScreen,
      passportEventEmitter: this.passportEventEmitter,
      signersPromise: this.createSingers(user.idToken),
    });
  }
}

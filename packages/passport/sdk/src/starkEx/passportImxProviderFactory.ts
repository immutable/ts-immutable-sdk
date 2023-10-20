import { ImmutableXClient } from '@imtbl/immutablex-client';
import { Web3Provider } from '@ethersproject/providers';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { PassportConfiguration } from '../config';
import AuthManager from '../authManager';
import { ConfirmationScreen } from '../confirmation';
import MagicAdapter from '../magicAdapter';
import {
  DeviceTokenResponse, PassportEventMap, User,
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

    return new PassportImxProvider({
      authManager: this.authManager,
      starkSigner,
      ethSigner,
      immutableXClient: this.immutableXClient,
      confirmationScreen: this.confirmationScreen,
      config: this.config,
      passportEventEmitter: this.passportEventEmitter,
    });
  }
}

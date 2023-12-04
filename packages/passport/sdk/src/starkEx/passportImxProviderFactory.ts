import { ImmutableXClient } from '@imtbl/immutablex-client';
import { IMXProvider } from '@imtbl/provider';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { PassportConfiguration } from '../config';
import AuthManager from '../authManager';
import { ConfirmationScreen } from '../confirmation';
import MagicAdapter from '../magicAdapter';
import {
  PassportEventMap,
  User,
} from '../types';
import TypedEventEmitter from '../utils/typedEventEmitter';
import { PassportImxProvider } from './passportImxProvider';

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
      user = await this.authManager.getUser();
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
    const user = await this.authManager.getUser();
    if (!user) {
      return null;
    }

    return this.createProviderInstance(user);
  }

  public async getProviderWithPKCEFlow(authorizationCode: string, state: string): Promise<IMXProvider> {
    const user = await this.authManager.connectImxPKCEFlow(authorizationCode, state);
    return this.createProviderInstance(user);
  }

  private async createProviderInstance(user: User): Promise<IMXProvider> {
    if (!user.idToken) {
      throw new PassportError(
        'Failed to initialise',
        PassportErrorType.WALLET_CONNECTION_ERROR,
      );
    }

    return new PassportImxProvider({
      config: this.config,
      authManager: this.authManager,
      immutableXClient: this.immutableXClient,
      confirmationScreen: this.confirmationScreen,
      passportEventEmitter: this.passportEventEmitter,
      magicAdapter: this.magicAdapter,
    });
  }
}

import { IMXClient } from '@imtbl/x-client';
import { IMXProvider } from '@imtbl/x-provider';
import { ImxApiClients } from '@imtbl/generated-clients';
import { PassportError, PassportErrorType } from '../errors/passportError';
import AuthManager from '../authManager';
import MagicAdapter from '../magicAdapter';
import { PassportEventMap, User } from '../types';
import TypedEventEmitter from '../utils/typedEventEmitter';
import { PassportImxProvider } from './passportImxProvider';
import GuardianClient from '../guardian';

export type PassportImxProviderFactoryInput = {
  authManager: AuthManager;
  immutableXClient: IMXClient;
  magicAdapter: MagicAdapter;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  imxApiClients: ImxApiClients;
  guardianClient: GuardianClient;
};

export class PassportImxProviderFactory {
  private readonly authManager: AuthManager;

  private readonly immutableXClient: IMXClient;

  private readonly magicAdapter: MagicAdapter;

  private readonly passportEventEmitter: TypedEventEmitter<PassportEventMap>;

  public readonly imxApiClients: ImxApiClients;

  private readonly guardianClient: GuardianClient;

  constructor({
    authManager,
    immutableXClient,
    magicAdapter,
    passportEventEmitter,
    imxApiClients,
    guardianClient,
  }: PassportImxProviderFactoryInput) {
    this.authManager = authManager;
    this.immutableXClient = immutableXClient;
    this.magicAdapter = magicAdapter;
    this.passportEventEmitter = passportEventEmitter;
    this.imxApiClients = imxApiClients;
    this.guardianClient = guardianClient;
  }

  public async getProvider(): Promise<IMXProvider> {
    const user = await this.authManager.getUserOrLogin();
    return this.createProviderInstance(user);
  }

  public async getProviderSilent(): Promise<IMXProvider | null> {
    const user = await this.authManager.getUser();
    if (!user) {
      return null;
    }

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
      authManager: this.authManager,
      immutableXClient: this.immutableXClient,
      passportEventEmitter: this.passportEventEmitter,
      magicAdapter: this.magicAdapter,
      imxApiClients: this.imxApiClients,
      guardianClient: this.guardianClient,
    });
  }
}

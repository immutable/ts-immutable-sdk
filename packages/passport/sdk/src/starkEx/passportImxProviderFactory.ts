import { IMXClient } from '@imtbl/x-client';
import { IMXProvider } from '@imtbl/x-provider';
import { ImxApiClients } from '@imtbl/generated-clients';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { AuthManager } from '@imtbl/auth';
import { PassportEventMap, User } from '../types';
import { PassportImxProvider } from './passportImxProvider';
import { GuardianClient, MagicTEESigner, TypedEventEmitter } from '@imtbl/wallet';

export type PassportImxProviderFactoryInput = {
  authManager: AuthManager;
  immutableXClient: IMXClient;
  magicTEESigner: MagicTEESigner;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  imxApiClients: ImxApiClients;
  guardianClient: GuardianClient;
};

export class PassportImxProviderFactory {
  private readonly authManager: AuthManager;

  private readonly immutableXClient: IMXClient;

  private readonly magicTEESigner: MagicTEESigner;

  private readonly passportEventEmitter: TypedEventEmitter<PassportEventMap>;

  public readonly imxApiClients: ImxApiClients;

  private readonly guardianClient: GuardianClient;

  constructor({
    authManager,
    immutableXClient,
    magicTEESigner,
    passportEventEmitter,
    imxApiClients,
    guardianClient,
  }: PassportImxProviderFactoryInput) {
    this.authManager = authManager;
    this.immutableXClient = immutableXClient;
    this.magicTEESigner = magicTEESigner;
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
      magicTEESigner: this.magicTEESigner,
      imxApiClients: this.imxApiClients,
      guardianClient: this.guardianClient,
    });
  }
}

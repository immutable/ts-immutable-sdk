import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { Networks, User } from './types';
import { PassportError, PassportErrorType } from './errors/passportError';

export type PassportConfig = {
  clientId: string;
  network?: Networks;
  redirectUri: string;
};

const checkRequiredConfiguration = (config: PassportConfig) => {
  const requiredConfiguration = ['clientId', 'redirectUri'];
  const errorMessage = requiredConfiguration
    .map((key) => !(config as Record<string, string>)[key] && key)
    .filter((n) => n)
    .join(', ');
  if (errorMessage !== '') {
    throw new PassportError(
      `${errorMessage} cannot be null`,
      PassportErrorType.INVALID_CONFIGURATION
    );
  }
};

export class PassportSDK {
  private authManager: AuthManager;
  private magicAdapter: MagicAdapter;

  constructor(config: PassportConfig) {
    checkRequiredConfiguration(config);

    this.authManager = new AuthManager(config);
    this.magicAdapter = new MagicAdapter(config.network);
  }

  public async connect(): Promise<User> {
    const user = await this.authManager.login();
    if (user.id_token) {
      await this.magicAdapter.login(user.id_token);
    }
    return user;
  }

  public async loginCallback(): Promise<void> {
    return this.authManager.loginCallback();
  }
}

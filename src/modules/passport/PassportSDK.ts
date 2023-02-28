import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { Networks } from './types';
import { PassportError, PassportErrorType } from './errors/passportError';
import { PassportWalletProvider } from './passportWalletProvider';
import PassportImxProvider from './imxProvider/passportImxProvider';

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
  private passportWalletProvider: PassportWalletProvider;
  constructor(config: PassportConfig) {
    checkRequiredConfiguration(config);

    this.authManager = new AuthManager(config);
    this.magicAdapter = new MagicAdapter(config.network);
    this.passportWalletProvider = new PassportWalletProvider(this.authManager, this.magicAdapter)
  }

  public async connect(): Promise<PassportImxProvider> {
    return this.passportWalletProvider.connect();
  }

  public getWalletProvider(): PassportWalletProvider {
    return this.passportWalletProvider;
  }

  public async loginCallback(): Promise<void> {
    return this.authManager.loginCallback();
  }
}

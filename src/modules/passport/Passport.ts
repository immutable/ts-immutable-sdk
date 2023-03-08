import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import PassportImxProvider from './imxProvider/passportImxProvider';
import { PassportError, PassportErrorType } from './errors/passportError';
import { getStarkSigner } from './stark';
import { UserProfile } from './types';
import { IMXProvider } from '../provider';
import { PassportConfiguration, ValidateConfig } from './config';

export class Passport {
  private authManager: AuthManager;
  private magicAdapter: MagicAdapter;

  constructor(config: PassportConfiguration) {
    ValidateConfig(config);

    this.authManager = new AuthManager(config);
    this.magicAdapter = new MagicAdapter(config);
  }

  public async connectImx(): Promise<IMXProvider> {
    const user = await this.authManager.login();
    if (!user.idToken) {
      throw new PassportError(
        'Failed to initialise',
        PassportErrorType.WALLET_CONNECTION_ERROR
      );
    }
    const provider = await this.magicAdapter.login(user.idToken);
    const signer = await getStarkSigner(provider.getSigner());
    return new PassportImxProvider(user, signer);
  }

  public async loginCallback(): Promise<void> {
    return this.authManager.loginCallback();
  }

  public async getUserInfo(): Promise<UserProfile> {
    const user = await this.authManager.getUser();
    return user.profile;
  }

  public async getIdToken(): Promise<string | undefined>{
    const user = await this.authManager.getUser();
    return user.idToken;
  }
}

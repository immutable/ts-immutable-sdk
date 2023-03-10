import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import PassportImxProvider from './imxProvider/passportImxProvider';
import { getPassportConfiguration } from './config';
import { PassportError, PassportErrorType } from './errors/passportError';
import { IMXProvider } from '../provider';
import { getStarkSigner } from './stark';
import { EnvironmentConfiguration, OidcConfiguration, UserProfile } from './types';

export class Passport {
  private authManager: AuthManager;
  private magicAdapter: MagicAdapter;

  constructor(
    environmentConfiguration: EnvironmentConfiguration,
    oidcConfiguration: OidcConfiguration,
  ) {
    const passportConfiguration = getPassportConfiguration(
      environmentConfiguration,
      oidcConfiguration,
    );

    this.authManager = new AuthManager(passportConfiguration);
    this.magicAdapter = new MagicAdapter(passportConfiguration);
  }

  public async connectImx(): Promise<IMXProvider> {
    let user = await this.authManager.login();
    if (!user.idToken) {
      throw new PassportError(
        'Failed to initialise',
        PassportErrorType.WALLET_CONNECTION_ERROR
      );
    }
    const provider = await this.magicAdapter.login(user.idToken);
    const signer = await getStarkSigner(provider.getSigner());
    if (!user.etherKey) {
      const updatedUser = await this.authManager.requestRefreshTokenAfterRegistration(user.accessToken);
      if (!updatedUser) {
        throw new PassportError(
          'Failed to get refresh token',
          PassportErrorType.REFRESH_TOKEN_ERROR
        );
      }
      user = updatedUser;
    }
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

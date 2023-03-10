import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import PassportImxProvider from './imxProvider/passportImxProvider';
import { PassportError, PassportErrorType } from './errors/passportError';
import { getStarkSigner } from './stark';
import { IMXProvider } from '../provider/imxProvider';
import { Networks, UserProfile } from './types';

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

export class Passport {
  private authManager: AuthManager;
  private magicAdapter: MagicAdapter;

  constructor(config: PassportConfig) {
    checkRequiredConfiguration(config);

    this.authManager = new AuthManager(config);
    this.magicAdapter = new MagicAdapter(config.network);
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

    // TODO https://immutable.atlassian.net/browse/ID-412: add back once user registration function is done and called
    // if (!user.etherKey) {
    //   const updatedUser = await this.authManager.requestRefreshTokenAfterRegistration(user.accessToken);
    //   if (!updatedUser) {
    //     throw new PassportError(
    //       'Failed to get refresh token',
    //       PassportErrorType.REFRESH_TOKEN_ERROR
    //     );
    //   }
    //   user = updatedUser;
    // }
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

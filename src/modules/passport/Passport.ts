import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import PassportImxProvider from './imxProvider/passportImxProvider';
import { getPassportConfiguration, PassportConfiguration } from './config';
import { PassportError, PassportErrorType } from './errors/passportError';
import { IMXProvider } from '../provider';
import { getStarkSigner } from './stark';
import { EnvironmentConfiguration, OidcConfiguration, User, UserProfile } from './types';
import { Configuration, EthSigner, StarkSigner, UsersApi } from '@imtbl/core-sdk';
import registerPassport from './workflows/registration';

export class Passport {
  private authManager: AuthManager;
  private magicAdapter: MagicAdapter;
  private readonly config: PassportConfiguration;

  constructor(
    environmentConfiguration: EnvironmentConfiguration,
    oidcConfiguration: OidcConfiguration,
  ) {
    const passportConfiguration = getPassportConfiguration(
      environmentConfiguration,
      oidcConfiguration,
    );

    this.config = passportConfiguration;
    this.authManager = new AuthManager(this.config);
    this.magicAdapter = new MagicAdapter(this.config);
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
    const ethSigner = provider.getSigner();
    const starkSigner = await getStarkSigner(ethSigner);

    if (!user.etherKey) {
      user = await this.registerUser(ethSigner, starkSigner, user.accessToken);
    }
    return new PassportImxProvider(user, starkSigner);
  }

  public async loginCallback(): Promise<void> {
    return this.authManager.loginCallback();
  }

  public async getUserInfo(): Promise<UserProfile> {
    const user = await this.authManager.getUser();
    return user.profile;
  }

  public async getIdToken(): Promise<string | undefined> {
    const user = await this.authManager.getUser();
    return user.idToken;
  }

  private async registerUser(uskSigner: EthSigner, starkSigner: StarkSigner, jwt: string): Promise<User> {
    const configuration = new Configuration({ basePath: this.config.imxAPIConfiguration.basePath });
    const usersApi = new UsersApi(configuration);
    try {
      await registerPassport({
        ethSigner: uskSigner,
        starkSigner,
        usersApi
      }, jwt);
    } catch (error) {
      throw new Error("error registering new passport user");
    }
    const updatedUser = await this.authManager.requestRefreshTokenAfterRegistration(jwt);
    if (!updatedUser) {
      throw new PassportError(
        'Failed to get refresh token',
        PassportErrorType.REFRESH_TOKEN_ERROR
      );
    }
    return updatedUser;
  }
}

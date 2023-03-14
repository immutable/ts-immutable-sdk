import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import PassportImxProvider from './imxProvider/passportImxProvider';
import { getPassportConfiguration, PassportConfiguration } from './config';
import { PassportError, PassportErrorType } from './errors/passportError';
import { IMXProvider } from '../provider';
import { getStarkSigner } from './stark';
import {
  EnvironmentConfiguration,
  OidcConfiguration,
  UserProfile,
  UserWithEtherKey,
} from './types';
import {
  Configuration,
  EthSigner,
  StarkSigner,
  UsersApi,
} from '@imtbl/core-sdk';
import registerPassport from './workflows/registration';

export class Passport {
  private authManager: AuthManager;
  private magicAdapter: MagicAdapter;
  private readonly config: PassportConfiguration;

  constructor(
    environmentConfiguration: EnvironmentConfiguration,
    oidcConfiguration: OidcConfiguration
  ) {
    const passportConfiguration = getPassportConfiguration(
      environmentConfiguration,
      oidcConfiguration
    );
    this.config = passportConfiguration;
    this.authManager = new AuthManager(this.config);
    this.magicAdapter = new MagicAdapter(this.config);
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
    const ethSigner = provider.getSigner();
    const starkSigner = await getStarkSigner(ethSigner);

    if (!user.etherKey) {
      const updatedUser = await this.registerUser(
        ethSigner,
        starkSigner,
        user.accessToken
      );
      return new PassportImxProvider({
        jwt: user,
        starkSigner,
        ethAddress: updatedUser.etherKey,
        apiConfig: this.config.imxAPIConfiguration,
      });
    }
    return new PassportImxProvider({
      jwt: user,
      starkSigner,
      ethAddress: user.etherKey,
      apiConfig: this.config.imxAPIConfiguration,
    });
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

  private async registerUser(
    userAdminKeySigner: EthSigner,
    starkSigner: StarkSigner,
    jwt: string
  ): Promise<UserWithEtherKey> {
    const configuration = new Configuration({
      basePath: this.config.imxAPIConfiguration.basePath,
    });
    const usersApi = new UsersApi(configuration);
    await registerPassport(
      {
        ethSigner: userAdminKeySigner,
        starkSigner,
        usersApi,
      },
      jwt
    );
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

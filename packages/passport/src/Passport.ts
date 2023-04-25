import {
  Configuration,
  EthSigner,
  StarkSigner,
  UsersApi,
} from '@imtbl/core-sdk';
import { IMXProvider } from '@imtbl/provider';
import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import PassportImxProvider from './imxProvider/passportImxProvider';
import { PassportConfiguration } from './config';
import { PassportError, PassportErrorType } from './errors/passportError';
import { getStarkSigner } from './stark';
import {
  PassportModuleConfiguration,
  UserProfile,
  UserWithEtherKey,
  User,
} from './types';
import registerPassport from './workflows/registration';

export class Passport {
  private authManager: AuthManager;
  private magicAdapter: MagicAdapter;
  private readonly config: PassportConfiguration;

  constructor(passportModuleConfiguration: PassportModuleConfiguration) {
    const passportConfiguration = new PassportConfiguration(
      passportModuleConfiguration
    );
    this.config = passportConfiguration;
    this.authManager = new AuthManager(this.config);
    this.magicAdapter = new MagicAdapter(this.config);
  }

  private async getImxProvider(user: User | null) {
    if (!user || !user.idToken) {
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
        user: updatedUser,
        starkSigner,
        passportConfig: this.config,
      });
    }
    const userWithEtherKey = user as UserWithEtherKey;
    return new PassportImxProvider({
      user: userWithEtherKey,
      starkSigner,
      passportConfig: this.config,
    });
  }

  public async reconnectImx(): Promise<IMXProvider | null> {
    const user = await this.authManager.getUser();
    if (!user || user.expired == undefined || user.expired) {
      return null;
    }
    return this.getImxProvider(user);
  }

  public async connectImx(): Promise<IMXProvider> {
    let user = await this.authManager.getUser();
    if (!user || user.expired == undefined || user.expired) {
      user = await this.authManager.login();
    }
    return this.getImxProvider(user);
  }

  public async loginCallback(): Promise<void> {
    return this.authManager.loginCallback();
  }

  public async logout(): Promise<void> {
    return this.authManager.logout();
  }

  public async getUserInfo(): Promise<UserProfile | undefined> {
    const user = await this.authManager.getUser();
    return user?.profile;
  }

  public async getIdToken(): Promise<string | undefined> {
    const user = await this.authManager.getUser();
    return user?.idToken;
  }

  public async getAccessToken(): Promise<string | undefined> {
    const user = await this.authManager.getUser();
    return user?.accessToken;
  }

  private async registerUser(
    userAdminKeySigner: EthSigner,
    starkSigner: StarkSigner,
    jwt: string
  ): Promise<UserWithEtherKey> {
    const configuration = new Configuration({
      basePath: this.config.imxApiBasePath,
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
    const updatedUser =
      await this.authManager.requestRefreshTokenAfterRegistration();
    if (!updatedUser) {
      throw new PassportError(
        'Failed to get refresh token',
        PassportErrorType.REFRESH_TOKEN_ERROR
      );
    }
    return updatedUser;
  }
}

export const createPassport = (
  passportModuleConfiguration: PassportModuleConfiguration
) => {
  const passport = new Passport(passportModuleConfiguration);
  const provider = passport.reconnectImx();
  return { passport, provider };
};

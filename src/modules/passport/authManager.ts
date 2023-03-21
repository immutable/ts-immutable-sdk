import { User as OidcUser, UserManager } from 'oidc-client-ts';
import { PassportErrorType, withPassportError } from './errors/passportError';
import { PassportMetadata, User, UserWithEtherKey } from './types';
import { retryWithDelay } from './util/retry';
import { getUserEtherKeyFromMetadata } from './getUserMetadata';
import { PassportConfiguration } from './config';

const getAuthConfiguration = ({
  oidcConfiguration,
}: PassportConfiguration) => ({
  authority: oidcConfiguration.authenticationDomain,
  redirect_uri: oidcConfiguration.redirectUri,
  popup_redirect_uri: oidcConfiguration.redirectUri,
  client_id: oidcConfiguration.clientId,
  metadata: {
    authorization_endpoint: `${oidcConfiguration.authenticationDomain}/authorize`,
    token_endpoint: `${oidcConfiguration.authenticationDomain}/oauth/token`,
    userinfo_endpoint: `${oidcConfiguration.authenticationDomain}/userinfo`,
  },
  loadUserInfo: true,
  scope: 'openid offline_access profile email create:users passport:user_create',
  extraQueryParams: {
    audience: 'platform_api',
  }
});

export default class AuthManager {
  private userManager;
  private config: PassportConfiguration;

  constructor(config: PassportConfiguration) {
    this.config = config;
    this.userManager = new UserManager(getAuthConfiguration(config));
  }

  private mapOidcUserToDomainModel = (oidcUser: OidcUser): User => {
    const passport = oidcUser.profile?.passport as PassportMetadata;
    return {
      idToken: oidcUser.id_token,
      accessToken: oidcUser.access_token,
      refreshToken: oidcUser.refresh_token,
      profile: {
        sub: oidcUser.profile.sub,
        email: oidcUser.profile.email,
        nickname: oidcUser.profile.nickname,
      },
      etherKey: passport?.ether_key || '',
    };
  };

  public async login(): Promise<User> {
    return withPassportError<User>(async () => {
      const oidcUser = await this.userManager.signinPopup();
      return this.mapOidcUserToDomainModel(oidcUser);
    }, PassportErrorType.AUTHENTICATION_ERROR);
  }

  public async loginCallback(): Promise<void> {
    return withPassportError<void>(
      async () => this.userManager.signinPopupCallback(),
      PassportErrorType.AUTHENTICATION_ERROR
    );
  }

  public async getUser(): Promise<User> {
    return withPassportError<User>(async () => {
      const oidcUser = await this.userManager.getUser();
      if (!oidcUser) {
        throw new Error('Failed to retrieve user');
      }
      return this.mapOidcUserToDomainModel(oidcUser);
    }, PassportErrorType.NOT_LOGGED_IN_ERROR);
  }

  public async requestRefreshTokenAfterRegistration(
    jwt: string
  ): Promise<UserWithEtherKey | null> {
    return withPassportError<UserWithEtherKey | null>(async () => {
      await retryWithDelay(() =>
        getUserEtherKeyFromMetadata(
          this.config.oidcConfiguration.authenticationDomain,
          jwt
        )
      );
      const updatedUser = await this.userManager.signinSilent();
      if (!updatedUser) {
        return null;
      }
      return this.mapOidcUserToDomainModel(updatedUser) as UserWithEtherKey;
    }, PassportErrorType.REFRESH_TOKEN_ERROR);
  }
}

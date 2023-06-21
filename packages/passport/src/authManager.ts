import {
  User as OidcUser,
  UserManager,
  UserManagerSettings,
} from 'oidc-client-ts';
import { PassportErrorType, withPassportError } from './errors/passportError';
import { PassportMetadata, User } from './types';
import { PassportConfiguration } from './config';

const getAuthConfiguration = ({
  oidcConfiguration,
  authenticationDomain,
}: PassportConfiguration): UserManagerSettings => {
  const baseConfiguration: UserManagerSettings = {
    authority: authenticationDomain,
    redirect_uri: oidcConfiguration.redirectUri,
    popup_redirect_uri: oidcConfiguration.redirectUri,
    client_id: oidcConfiguration.clientId,
    metadata: {
      authorization_endpoint: `${authenticationDomain}/authorize`,
      token_endpoint: `${authenticationDomain}/oauth/token`,
      userinfo_endpoint: `${authenticationDomain}/userinfo`,
      end_session_endpoint:
        `${authenticationDomain}/v2/logout`
        + `?returnTo=${encodeURIComponent(oidcConfiguration.logoutRedirectUri)}`
        + `&client_id=${oidcConfiguration.clientId}`,
    },
    mergeClaims: true,
    loadUserInfo: true,
    scope: oidcConfiguration.scope,
  };

  if (oidcConfiguration.audience) {
    baseConfiguration.extraQueryParams = {
      audience: oidcConfiguration.audience,
    };
  }
  return baseConfiguration;
};

export default class AuthManager {
  private userManager;

  private config: PassportConfiguration;

  constructor(config: PassportConfiguration) {
    this.config = config;
    this.userManager = new UserManager(getAuthConfiguration(config));
  }

  private static mapOidcUserToDomainModel = (oidcUser: OidcUser): User => {
    const passport = oidcUser.profile?.passport as PassportMetadata;
    return {
      expired: oidcUser.expired,
      idToken: oidcUser.id_token,
      accessToken: oidcUser.access_token,
      refreshToken: oidcUser.refresh_token,
      profile: {
        sub: oidcUser.profile.sub,
        email: oidcUser.profile.email,
        nickname: oidcUser.profile.nickname,
      },
      etherKey: passport?.ether_key || '',
      starkKey: passport?.stark_key || '',
      userAdminKey: passport?.user_admin_key || '',
    };
  };

  public async login(): Promise<User> {
    return withPassportError<User>(async () => {
      const popupWindowFeatures = { width: 410, height: 450 };
      const oidcUser = await this.userManager.signinPopup({
        popupWindowFeatures,
      });

      return AuthManager.mapOidcUserToDomainModel(oidcUser);
    }, PassportErrorType.AUTHENTICATION_ERROR);
  }

  public async loginCallback(): Promise<void> {
    return withPassportError<void>(
      async () => this.userManager.signinPopupCallback(),
      PassportErrorType.AUTHENTICATION_ERROR,
    );
  }

  public async logout(): Promise<void> {
    return withPassportError<void>(
      async () => this.userManager.signoutRedirect(),
      PassportErrorType.LOGOUT_ERROR,
    );
  }

  public async loginSilent(): Promise<User | null> {
    return withPassportError<User | null>(async () => {
      const existedUser = await this.getUser();
      if (!existedUser) {
        return null;
      }
      const oidcUser = await this.userManager.signinSilent();
      if (!oidcUser) {
        return null;
      }
      return AuthManager.mapOidcUserToDomainModel(oidcUser);
    }, PassportErrorType.SILENT_LOGIN_ERROR);
  }

  public async getUser(): Promise<User | null> {
    return withPassportError<User | null>(async () => {
      const oidcUser = await this.userManager.getUser();
      if (!oidcUser) {
        return null;
      }
      return AuthManager.mapOidcUserToDomainModel(oidcUser);
    }, PassportErrorType.NOT_LOGGED_IN_ERROR);
  }
}

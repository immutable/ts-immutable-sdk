import { User as OidcUser, UserManager } from 'oidc-client-ts';
import { PassportErrorType, withPassportError } from './errors/passportError';
import { User } from './types';
import { PassportConfiguration } from './config/config';

const getAuthConfiguration = ({ oidcConfiguration }: PassportConfiguration) => ({
  authority: oidcConfiguration.authenticationDomain,
  redirect_uri: oidcConfiguration.redirectUri,
  popup_redirect_uri: oidcConfiguration.redirectUri,
  client_id: oidcConfiguration.clientId,
  metadata: {
    authorization_endpoint: `${oidcConfiguration.authenticationDomain}/authorize`,
    token_endpoint: `${oidcConfiguration.authenticationDomain}/oauth/token`,
  },
});

export default class AuthManager {
  private userManager;
  constructor(config: PassportConfiguration) {
    this.userManager = new UserManager(
      getAuthConfiguration(config),
    );
  }

  private mapOidcUserToDomainModel = (oidcUser: OidcUser): User => ({
    idToken: oidcUser.id_token,
    accessToken: oidcUser.access_token,
    refreshToken: oidcUser.refresh_token,
    profile: {
      sub: oidcUser.profile.sub,
      email: oidcUser.profile.email,
      nickname: oidcUser.profile.nickname,
    },
  });

  public async login(): Promise<User> {
    return withPassportError<User>(async () => {
      const oidcUser = await this.userManager.signinPopup();
      return this.mapOidcUserToDomainModel(oidcUser);
    }, {
      type: PassportErrorType.AUTHENTICATION_ERROR,
    });
  }

  public async loginCallback(): Promise<void> {
    return withPassportError<void>(
      async () => this.userManager.signinPopupCallback(),
      {
        type: PassportErrorType.AUTHENTICATION_ERROR,
      }
    );
  }

  public async getUser(): Promise<User> {
    return withPassportError<User>(async () => {
      const oidcUser = await this.userManager.getUser();
      if (!oidcUser) {
        throw new Error('Failed to retrieve user');
      }
      return this.mapOidcUserToDomainModel(oidcUser);
    }, {
      type: PassportErrorType.NOT_LOGGED_IN_ERROR,
    })
  }
}

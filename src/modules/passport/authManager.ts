import { User as OidcUser, UserManager } from 'oidc-client-ts';
import { PassportErrorType, withPassportError } from './errors/passportError';
import { User } from './types';
import { retryWithDelay } from './util/retry';
import { getEtherKeyFromUserMetadata } from './getEtherKeyFromUserMetadata';

type AuthInput = {
  clientId: string;
  redirectUri: string;
};

// TODO: This is a static Auth0 domain that could come from env or config file
const passportAuthDomain = 'https://auth.dev.immutable.com';

const getAuthConfiguration = ({ clientId, redirectUri }: AuthInput) => ({
  authority: passportAuthDomain,
  redirect_uri: redirectUri,
  popup_redirect_uri: redirectUri,
  client_id: clientId,
  metadata: {
    authorization_endpoint: `${passportAuthDomain}/authorize`,
    token_endpoint: `${passportAuthDomain}/oauth/token`,
  },
});

export default class AuthManager {
  private userManager;

  constructor({ clientId, redirectUri }: AuthInput) {
    this.userManager = new UserManager(
      getAuthConfiguration({
        clientId,
        redirectUri,
      })
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
    });
  }

  public async refreshToken(): Promise<OidcUser | null> {
    return withPassportError<OidcUser | null>(async () => this.userManager.signinSilent(), {
      type: PassportErrorType.REFRESH_TOKEN_ERROR,
    });
  }

  public async requestRefreshToken(jwt: string): Promise<User | null> {
    return withPassportError<User | null>(async () => {
      const etherKey = await retryWithDelay(() => getEtherKeyFromUserMetadata(passportAuthDomain, jwt));
      console.info('requesting refresh token');
      const updatedUser = await this.refreshToken();
      if (!updatedUser) {
        return null;
      }
      return {
        idToken: updatedUser.id_token,
        accessToken: updatedUser.access_token,
        refreshToken: updatedUser.refresh_token,
        profile: updatedUser.profile,
        etherKey,
      };
    }, {
      type: PassportErrorType.REFRESH_TOKEN_ERROR,
    });
  }
}

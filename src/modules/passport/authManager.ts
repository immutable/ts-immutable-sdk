import {UserManager} from 'oidc-client-ts';
import {PassportErrorType, withPassportError} from './errors/passportError';
import {User} from './types';

type AuthInput = {
    clientId: string;
    redirectUri: string;
};

// TODO: This is a static Auth0 domain that could come from env or config file
const passportAuthDomain = 'https://auth.dev.immutable.com';

const getAuthConfiguration = ({clientId, redirectUri}: AuthInput) => ({
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

    constructor({clientId, redirectUri}: AuthInput) {
        this.userManager = new UserManager(
            getAuthConfiguration({
                clientId,
                redirectUri,
            })
        );
    }

    public async refreshToken(): Promise<User | null> {
        return withPassportError<User | null>(async () => this.userManager.signinSilent(), {
            type: PassportErrorType.REFRESH_TOKEN_ERROR,
        });
    }


    public async login(): Promise<User> {
        return withPassportError<User>(async () => this.userManager.signinPopup(), {
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
}

import axios from 'axios';
import AuthManager from './authManager';
import { PassportErrorType, withPassportError } from './errors/passportError';
import { retryWithDelay } from './util/retry';
import { User } from './types';

// TODO: This is a static Auth0 domain that could come from env or config file
const PASSPORT_AUTH_DOMAIN = 'https://auth.dev.immutable.com';

const checkWalletAddressExists = async (jwt: string): Promise<string> => {
    const { data } = await axios.get(`${PASSPORT_AUTH_DOMAIN}/userinfo`, {
        headers: {
            Authorization: `Bearer ` + jwt
        }
    });
    const metadataExists = !!data?.passport?.ether_key && !!data?.passport?.stark_key && !!data?.passport?.user_admin_key;
    if (metadataExists) {
        return data.passport.ether_key
    }
    console.info('user wallet addresses not exist')
    return Promise.reject('user wallet addresses not exist')
}


export const requestRefreshToken = async (authManger: AuthManager, jwt: string): Promise<User | null> => {
    return withPassportError<User | null>(async () => {
        const etherKey = await retryWithDelay(() => checkWalletAddressExists(jwt))
        console.info('requesting refresh token')
        const updatedUser = await authManger.refreshToken();
        if (!updatedUser) {
            return null
        }
        return {
            idToken: updatedUser?.id_token,
            accessToken: updatedUser?.access_token,
            refreshToken: updatedUser?.refresh_token,
            profile: updatedUser?.profile,
            etherKey,
        }
    }, {
        type: PassportErrorType.REFRESH_TOKEN_ERROR,
    });
}

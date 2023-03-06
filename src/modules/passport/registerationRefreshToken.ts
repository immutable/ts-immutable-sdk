import axios from "axios";
import AuthManager from "./authManager";
import {User} from "./types";
import {PassportErrorType, withPassportError} from "./errors/passportError";
import {retryWithDelay} from "./util/retry";

// TODO: This is a static Auth0 domain that could come from env or config file
const PASSPORT_AUTH_DOMAIN = 'https://auth.dev.immutable.com';


const checkWalletAddressExists = async (jwt: string): Promise<boolean> => {
    return withPassportError<boolean>(async () => {
        const {data} = await axios.get(`${PASSPORT_AUTH_DOMAIN}/userinfo`, {
            headers: {
                Authorization: `Bearer ` + jwt
            }
        });
        const starkEx = data?.passport?.stark_ex
        const metadataExists = !!starkEx?.ether_key && !!starkEx?.stark_key && !!starkEx?.user_admin_key;
        if (metadataExists) {
            return true
        }
        console.info("user wallet addresses not exist")
        return Promise.reject("user wallet addresses not exist")
    }, {
        type: PassportErrorType.FETCHING_USER_INFO_ERROR,
    });

}

export const requestRefreshToken = async (authManger: AuthManager, jwt: string): Promise<User | null> => {
    return withPassportError<User | null>(async () => {
        await retryWithDelay(() => checkWalletAddressExists(jwt))
        console.info("requesting refresh token")
        return await authManger.refreshToken()
    }, {
        type: PassportErrorType.REFRESH_TOKEN_ERROR,
    });
}

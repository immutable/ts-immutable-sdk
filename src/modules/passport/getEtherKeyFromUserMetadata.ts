import axios from 'axios';

// TODO: This is a static Auth0 domain that could come from env or config file
const PASSPORT_AUTH_DOMAIN = 'https://auth.dev.immutable.com';

export const getEtherKeyFromUserMetadata = async (jwt: string): Promise<string> => {
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
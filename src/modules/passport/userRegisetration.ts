import axios, {AxiosError} from "axios";

// TODO: imx apis & env & registration url are static properties that could come from env or config file
const IMX_API = "https://api.dev.x.immutable.com"
const PASSPORT_REGISTRATION_URL = `${IMX_API}/v1/passport/users`


export type PassportUserRegistrationRequest = {
    ether_key: string
    eth_signature: string
    stark_key: string
    stark_signature: string
}

export const registerPassportUser = async (body: PassportUserRegistrationRequest, jwt: string): Promise<number> => {
    try {
        const {status} = await axios.post(PASSPORT_REGISTRATION_URL, body, {
                headers: {
                    'Authorization': 'Bearer ' + jwt
                }
            }
        )
        return status
    } catch (error) {
        const err = error as AxiosError
        console.log(err.response?.data)
        throw new Error('error registering passport user');
    }
}
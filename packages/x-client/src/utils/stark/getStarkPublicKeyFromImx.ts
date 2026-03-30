import axios from 'axios';

type ImxAccount = {
  accounts: string[];
};

interface StarkUserResponse {
  starkPublicKey: string;
  accountNotFound: boolean;
}

/**
 * @description Gets the account (stark public key) value of the requested user
 * (ethAddress) for Production environment only.
 * @param ethAddress {string}
 * @returns {Promise<StarkUserResponse | undefined>}
 */
export async function getStarkPublicKeyFromImx(
  ethAddress: string,
): Promise<StarkUserResponse | undefined> {
  try {
    if (ethAddress) {
      const response = await axios.get(
        `https://api.x.immutable.com/v1/users/${ethAddress}`,
      );
      const user = response.data as ImxAccount;

      if (user?.accounts && user.accounts.length > 0) {
        // Only one account per user
        return { starkPublicKey: user.accounts[0], accountNotFound: false };
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data.code === 'account_not_found') {
      return { starkPublicKey: '', accountNotFound: true };
    }
  }

  return undefined;
}

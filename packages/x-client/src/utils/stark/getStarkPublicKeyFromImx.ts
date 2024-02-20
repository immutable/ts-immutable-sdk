// import fetch from 'node-fetch';
import axios from 'axios';

type ImxAccount = {
  accounts: string[];
};

type ImxError = {
  code: string;
  message: string;
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
  if (ethAddress) {
    const response = await axios.get(
      `https://api.x.immutable.com/v1/users/${ethAddress}`,
    );
    const user = response.data as ImxAccount;
    if (user?.accounts && user.accounts.length > 0) {
      // Only one account per user
      return { starkPublicKey: user.accounts[0], accountNotFound: false };
    }
    const imxError = response.data as ImxError;
    if (imxError?.code === 'account_not_found') {
      // This means a new account. So lets use the value from default GrindKey function.
      return { starkPublicKey: '', accountNotFound: true };
    }
  }
  // if (ethAddress) {
  //   const response = await fetch(
  //     `https://api.x.immutable.com/v1/users/${ethAddress}`,
  //   );
  //   const jsonResponse = await response.json();
  //   const user = jsonResponse as ImxAccount;
  //   if (user?.accounts && user.accounts.length > 0) {
  //     // Only one account per user
  //     return { starkPublicKey: user.accounts[0], accountNotFound: false };
  //   }
  //   const imxError = jsonResponse as ImxError;
  //   if (imxError?.code === 'account_not_found') {
  //     // This means a new account. So lets use the value from default GrindKey function.
  //     return { starkPublicKey: '', accountNotFound: true };
  //   }
  // }
  return undefined;
}

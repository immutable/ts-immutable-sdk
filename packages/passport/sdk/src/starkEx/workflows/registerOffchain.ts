import {
  EthSigner, RegisterUserResponse, StarkSigner, UsersApi,
} from '@imtbl/core-sdk';
import AuthManager from 'authManager';
import { PassportErrorType, withPassportError } from 'errors/passportError';
import { retryWithDelay } from 'network/retry';
import { User } from 'types';
import axios from 'axios';
import registerPassportStarkEx from './registration';

async function forceUserRefresh(authManager: AuthManager) {
  // User metadata is updated asynchronously. Poll userinfo endpoint until it is updated.
  await retryWithDelay<User | null>(async () => {
    const user = await authManager.loginSilent({ forceRefresh: true }); // force refresh to get updated user info
    if (user?.imx) return user;

    return Promise.reject(new Error('user wallet addresses not exist'));
  });
}

export default async function registerOffchain(
  userAdminKeySigner: EthSigner,
  starkSigner: StarkSigner,
  unregisteredUser: User,
  authManager: AuthManager,
  usersApi: UsersApi,
) {
  return withPassportError<RegisterUserResponse>(async () => {
    try {
      const response = await registerPassportStarkEx(
        {
          ethSigner: userAdminKeySigner,
          starkSigner,
          usersApi,
        },
        unregisteredUser.accessToken,
      );
      await forceUserRefresh(authManager);

      return response;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.status === 409) {
        // The user already registered, but the user token is not updated yet.
        await forceUserRefresh(authManager);
        return { tx_hash: '' };
      }

      throw err;
    }
  }, PassportErrorType.USER_REGISTRATION_ERROR);
}

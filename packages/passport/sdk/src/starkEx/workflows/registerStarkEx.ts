import {
  EthSigner, RegisterUserResponse, StarkSigner, UsersApi,
} from '@imtbl/core-sdk';
import AuthManager from 'authManager';
import { PassportErrorType, withPassportError } from 'errors/passportError';
import { retryWithDelay } from 'network/retry';
import { User } from 'types';
import registerPassportStarkEx from './registration';

export default async function registerStarkEx(
  userAdminKeySigner: EthSigner,
  starkSigner: StarkSigner,
  unregisteredUser: User,
  authManager: AuthManager,
  usersApi: UsersApi,
) {
  return withPassportError<RegisterUserResponse>(async () => {
    const registerResponse = await registerPassportStarkEx(
      {
        ethSigner: userAdminKeySigner,
        starkSigner,
        usersApi,
      },
      unregisteredUser.accessToken,
    );

    // User metadata is updated asynchronously. Poll userinfo endpoint until it is updated.
    await retryWithDelay<User | null>(async () => {
      const user = await authManager.loginSilent({ forceRefresh: true }); // force refresh to get updated user info
      const metadataExists = !!user?.imx;
      if (metadataExists) {
        return user;
      }
      return Promise.reject(new Error('user wallet addresses not exist'));
    });

    return registerResponse;
  }, PassportErrorType.REFRESH_TOKEN_ERROR);
}

import { ImxApiClients, imx } from '@imtbl/generated-clients';
import { EthSigner, StarkSigner } from '@imtbl/x-client';
import { Auth, User } from '@imtbl/auth';
import { retryWithDelay } from '@imtbl/wallet';
import { PassportErrorType, withPassportError } from '../../errors/passportError';
import { toUserImx } from '../../utils/imxUser';
import registerPassportStarkEx from './registration';
import { getHttpStatus } from '../../utils/httpError';

async function forceUserRefresh(auth: Auth) {
  // User metadata is updated asynchronously. Poll userinfo endpoint until it is updated.
  await retryWithDelay<User | null>(async () => {
    const user = await auth.forceUserRefresh(); // force refresh to get updated user info
    if (!user) {
      return Promise.reject(new Error('user wallet addresses not exist'));
    }

    try {
      toUserImx(user);
      return user;
    } catch {
      return Promise.reject(new Error('user wallet addresses not exist'));
    }
  });
}

export default async function registerOffchain(
  userAdminKeySigner: EthSigner,
  starkSigner: StarkSigner,
  unregisteredUser: User,
  auth: Auth,
  imxApiClients: ImxApiClients,
) {
  return withPassportError<imx.RegisterUserResponse>(async () => {
    try {
      const response = await registerPassportStarkEx(
        {
          ethSigner: userAdminKeySigner,
          starkSigner,
          imxApiClients,
        },
        unregisteredUser.accessToken,
      );
      await forceUserRefresh(auth);

      return response;
    } catch (err: unknown) {
      if (getHttpStatus(err) === 409) {
        // The user already registered, but the user token is not updated yet.
        await forceUserRefresh(auth);
        return { tx_hash: '' };
      }

      throw err;
    }
  }, PassportErrorType.USER_REGISTRATION_ERROR);
}

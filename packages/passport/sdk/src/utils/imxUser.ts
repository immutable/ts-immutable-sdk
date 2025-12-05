import jwt_decode from 'jwt-decode';
import type { User, IdTokenPayload } from '@imtbl/auth';
import { PassportError, PassportErrorType } from '../errors/passportError';

type ImxMetadata = {
  imx_eth_address?: string;
  imx_stark_address?: string;
  imx_user_admin_address?: string;
};

type PassportPayload = IdTokenPayload & {
  passport?: ImxMetadata;
};

export type UserImx = User & {
  imx: {
    ethAddress: string;
    starkAddress: string;
    userAdminAddress: string;
  };
};

export const toUserImx = (user: User): UserImx => {
  if (!user.idToken) {
    throw new PassportError(
      'User has been logged out',
      PassportErrorType.NOT_LOGGED_IN_ERROR,
    );
  }

  const payload = jwt_decode<PassportPayload>(user.idToken);
  const metadata = payload.passport;

  if (
    !metadata?.imx_eth_address
    || !metadata?.imx_stark_address
    || !metadata?.imx_user_admin_address
  ) {
    throw new PassportError(
      'User has not been registered with StarkEx',
      PassportErrorType.USER_NOT_REGISTERED_ERROR,
    );
  }

  return {
    ...user,
    imx: {
      ethAddress: metadata.imx_eth_address,
      starkAddress: metadata.imx_stark_address,
      userAdminAddress: metadata.imx_user_admin_address,
    },
  };
};

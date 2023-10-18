import { signRaw } from '@imtbl/toolkit';
import { RegisterUserResponse, UsersApi, WalletConnection } from '@imtbl/core-sdk';
import { PassportErrorType, withPassportError } from '../../errors/passportError';

export type RegisterPassportParams = WalletConnection & {
  usersApi: UsersApi;
};

export default async function registerPassport(
  { ethSigner, starkSigner, usersApi }: RegisterPassportParams,
  authorization: string,
): Promise<RegisterUserResponse> {
  return withPassportError<RegisterUserResponse>(async () => {
    const [userAddress, starkPublicKey] = await Promise.all([
      ethSigner.getAddress(),
      starkSigner.getAddress(),
    ]);

    const signableResult = await usersApi.getSignableRegistrationOffchain({
      getSignableRegistrationRequest: {
        ether_key: userAddress,
        stark_key: starkPublicKey,
      },
    });

    const { signable_message: signableMessage, payload_hash: payloadHash } = signableResult.data;
    const [ethSignature, starkSignature] = await Promise.all([
      signRaw(signableMessage, ethSigner),
      starkSigner.signMessage(payloadHash),
    ]);

    const response = await usersApi.registerPassportUser({
      authorization: `Bearer ${authorization}`,
      registerPassportUserRequest: {
        eth_signature: ethSignature,
        ether_key: userAddress,
        stark_signature: starkSignature,
        stark_key: starkPublicKey,
      },
    });
    return response.data as RegisterUserResponse;
  }, PassportErrorType.USER_REGISTRATION_ERROR);
}

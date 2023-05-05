import { signRaw } from '@imtbl/toolkit';
import { UsersApi, WalletConnection } from '@imtbl/core-sdk';
import { PassportErrorType, withPassportError } from '../errors/passportError';

export type registerPassportParams = WalletConnection & {
  usersApi: UsersApi;
};

export default async function registerPassport(
  { ethSigner, starkSigner, usersApi }: registerPassportParams,
  authorization: string,
): Promise<string> {
  return withPassportError<string>(async () => {
    const userAddress = await ethSigner.getAddress();
    const starkPublicKey = await starkSigner.getAddress();

    const signableResult = await usersApi.getSignableRegistrationOffchain({
      getSignableRegistrationRequest: {
        ether_key: userAddress,
        stark_key: starkPublicKey,
      },
    });

    const { signable_message: signableMessage, payload_hash: payloadHash } = signableResult.data;
    const ethSignature = await signRaw(signableMessage, ethSigner);
    const starkSignature = await starkSigner.signMessage(payloadHash);

    const response = await usersApi.registerPassportUser({
      authorization: `Bearer ${authorization}`,
      registerPassportUserRequest: {
        eth_signature: ethSignature,
        ether_key: userAddress,
        stark_signature: starkSignature,
        stark_key: starkPublicKey,
      },
    });
    return response.statusText;
  }, PassportErrorType.USER_REGISTRATION_ERROR);
}

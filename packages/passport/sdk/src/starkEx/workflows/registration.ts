import { signRaw } from '@imtbl/toolkit';
import { WalletConnection } from '@imtbl/x-client';
import { ImxApiClients, imx } from '@imtbl/generated-clients';

export type RegisterPassportParams = WalletConnection & {
  imxApiClients: ImxApiClients;
};

export default async function registerPassport(
  { ethSigner, starkSigner, imxApiClients }: RegisterPassportParams,
  authorization: string,
): Promise<imx.RegisterUserResponse> {
  const [userAddress, starkPublicKey] = await Promise.all([
    ethSigner.getAddress(),
    starkSigner.getAddress(),
  ]);

  const signableResult = await imxApiClients.usersApi.getSignableRegistrationOffchain({
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

  const response = await imxApiClients.usersApi.registerPassportUserV2({
    authorization: `Bearer ${authorization}`,
    registerPassportUserRequest: {
      eth_signature: ethSignature,
      ether_key: userAddress,
      stark_signature: starkSignature,
      stark_key: starkPublicKey,
    },
  });
  return response.data as imx.RegisterUserResponse;
}

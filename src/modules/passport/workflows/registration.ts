import { signRaw } from '../../provider/signable-actions/utils';
import { UsersApi, WalletConnection } from '@imtbl/core-sdk';


export type registerPassportWorkflowParams = WalletConnection & {
  usersApi: UsersApi;
};

export async function registerPassportWorkflow({
  ethSigner,
  starkSigner,
  usersApi
}: registerPassportWorkflowParams, authorization: string): Promise<string> {
  const userAddress = await ethSigner.getAddress();
  const starkPublicKey = await starkSigner.getAddress();

  const signableResult = await usersApi.getSignableRegistrationOffchain({
    getSignableRegistrationRequest: {
      ether_key: userAddress,
      stark_key: starkPublicKey,
    },
  });

  const { signable_message: signableMessage, payload_hash: payloadHash } =
    signableResult.data;

  const ethSignature = await signRaw(signableMessage, ethSigner);

  const starkSignature = await starkSigner.signMessage(payloadHash);

  const response = await usersApi.registerPassportUser({
    authorization: authorization,
    registerPassportUserRequest: {
      eth_signature: ethSignature,
      ether_key: userAddress,
      stark_signature: starkSignature,
      stark_key: starkPublicKey,
    },
  });

  return response.statusText;
}

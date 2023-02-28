import { RegisterUserResponse, StarkEx } from "src";
import { StarkSigner, GetSignableRegistrationResponse } from "src/types";
import { EthSigner,  } from "@imtbl/core-sdk";


type workflowParams = {
  ethSigner: EthSigner;
  starkExSigner: StarkSigner;
};

export async function registerOffchain({ethSigner, starkExSigner}: workflowParams): Promise<RegisterUserResponse> {
  const userAddress = await ethSigner.getAddress();
  const starkPublicKey = await starkExSigner.getAddress();

  const signableResult = await StarkEx.usersApi.getSignableRegistrationOffchain({
    getSignableRegistrationRequest: {
      ether_key: userAddress,
      stark_key: starkPublicKey,
    },
  });

  const {
    signable_message: signableMessage,
    payload_hash: payloadHash,
  } = signableResult.data;

  const ethSignature = await signRaw(signableMessage, ethSigner);

  const starkSignature = await starkExSigner.signMessage(payloadHash);

  const registeredUser = await StarkEx.usersApi.registerUser({
    registerUserRequest: {
      eth_signature: ethSignature,
      ether_key: userAddress,
      stark_signature: starkSignature,
      stark_key: starkPublicKey,
    },
  });

  return registeredUser.data;
}

export async function isRegisteredOnChain(
  starkPublicKey: string,
  contract: Registration,
): Promise<boolean> {
  try {
    return await contract.isRegistered(starkPublicKey);
  } catch (ex) {
    if ((ex as IsRegisteredCheckError).reason === 'USER_UNREGISTERED') {
      return false;
    }
    throw ex;
  }
}

export async function getSignableRegistrationOnchain(
  etherKey: string,
  starkPublicKey: string
): Promise<GetSignableRegistrationResponse> {
  const response = await StarkEx.usersApi.getSignableRegistration({
    getSignableRegistrationRequest: {
      ether_key: etherKey,
      stark_key: starkPublicKey,
    },
  });
  return {
    operator_signature: response.data.operator_signature,
    payload_hash: response.data.payload_hash,
  };
}

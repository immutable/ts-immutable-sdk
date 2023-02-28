import { RegisterUserResponse, StarkEx } from "src";
import { GetSignableRegistrationResponse } from "src/types";
import { Signers } from "./types";
import { validateChain } from "./helpers";
import { Config, Contracts } from "@imtbl/core-sdk";
import { signRaw } from "./utils/crypto";
import { Immutable } from "../../apis/starkex/immutable";

export async function registerOffchain(signers: Signers, imx:Immutable
): Promise<RegisterUserResponse> {
  await validateChain(signers.ethSigner, imx.getConfig());

  const userAddress = await signers.ethSigner.getAddress();
  const starkPublicKey = await signers.starkExSigner.getAddress();

  const signableResult = await imx.StarkEx.usersApi.getSignableRegistrationOffchain({
    getSignableRegistrationRequest:{ether_key: userAddress, stark_key:starkPublicKey}});

  const {
    signable_message: signableMessage,
    payload_hash: payloadHash,
  } = signableResult.data;

  const ethSignature = await signRaw(signableMessage, signers.ethSigner);

  const starkSignature = await signers.starkExSigner.signMessage(payloadHash);

  const registeredUser = await imx.StarkEx.usersApi.registerUser({
    registerUserRequest: {
      eth_signature: ethSignature,
      ether_key: userAddress,
      stark_signature: starkSignature,
      stark_key: starkPublicKey,
    },
  });

  return registeredUser.data;
}

interface IsRegisteredCheckError {
  reason: string;
}

export async function isRegisteredOnChain(
  signers:Signers, imx:Immutable
): Promise<boolean> {
  await validateChain(signers.ethSigner, imx.getConfig());

  //FixMe: use configs same as immutable client
  const registrationContract = Contracts.Registration.connect(
    Config.SANDBOX.ethConfiguration.registrationContractAddress,
    signers.ethSigner,
  );

  try {
    const starkPublicKey = await signers.starkExSigner.getAddress();
    return await registrationContract.isRegistered(starkPublicKey);
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

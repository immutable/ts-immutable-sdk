import { RegisterUserResponse, GetSignableRegistrationResponse } from 'types';
import { Signers } from './types';
import { validateChain } from './helpers';
import {
  EthSigner,
  Contracts,
  UsersApi,
} from '@imtbl/core-sdk';
import { signRaw } from './utils';
import { Configuration } from 'config';

export async function registerOffchain(
  signers: Signers,
  config: Configuration
): Promise<RegisterUserResponse> {
  await validateChain(signers.ethSigner, config.getStarkExConfig());
  const usersApi = new UsersApi(config.getStarkExConfig().apiConfiguration);

  const userAddress = await signers.ethSigner.getAddress();
  const starkPublicKey = await signers.starkExSigner.getAddress();

  const signableResult = await usersApi.getSignableRegistrationOffchain({
    getSignableRegistrationRequest: {
      ether_key: userAddress,
      stark_key: starkPublicKey,
    },
  });

  const { signable_message: signableMessage, payload_hash: payloadHash } =
    signableResult.data;

  const ethSignature = await signRaw(signableMessage, signers.ethSigner);

  const starkSignature = await signers.starkExSigner.signMessage(payloadHash);

  const registeredUser = await usersApi.registerUser({
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
  starkPublicKey: string,
  ethSigner: EthSigner,
  config: Configuration
): Promise<boolean> {
  await validateChain(ethSigner, config.getStarkExConfig());

  const registrationContract = Contracts.Registration.connect(
    config.getStarkExConfig().ethConfiguration.registrationContractAddress,
    ethSigner
  );

  try {
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
  starkPublicKey: string,
  usersApi: UsersApi
): Promise<GetSignableRegistrationResponse> {
  const response = await usersApi.getSignableRegistration({
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

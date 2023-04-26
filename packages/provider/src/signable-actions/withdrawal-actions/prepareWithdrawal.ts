import {
  WithdrawalsApi,
  CreateWithdrawalResponse,
  ImmutableXConfiguration,
} from '@imtbl/core-sdk';
import { TokenAmount } from '@imtbl/core-sdk';
import { signMessage, convertToSignableToken } from '@imtbl/toolkit';
import { Signers } from '../types';
import { validateChain } from '../helpers';

const assertIsDefined = <T>(value?: T): T => {
  if (value !== undefined) return value;
  throw new Error('undefined field exception');
};

export type PrepareWithdrawalWorkflowParams = TokenAmount & {
  signers: Signers;
  config: ImmutableXConfiguration;
};

export async function prepareWithdrawalAction(
  params: PrepareWithdrawalWorkflowParams
): Promise<CreateWithdrawalResponse> {
  const {
    signers: { ethSigner, starkSigner },
    type,
    config,
  } = params;
  await validateChain(ethSigner, params.config);
  const withdrawalsApi = new WithdrawalsApi(config.apiConfiguration);
  const withdrawalAmount = type === 'ERC721' ? '1' : params.amount;
  const signableWithdrawalResult = await withdrawalsApi.getSignableWithdrawal({
    getSignableWithdrawalRequest: {
      user: await ethSigner.getAddress(),
      token: convertToSignableToken(params),
      amount: withdrawalAmount,
    },
  });

  const { signable_message: signableMessage, payload_hash: payloadHash } =
    signableWithdrawalResult.data;

  const starkSignature = await starkSigner.signMessage(payloadHash);

  const { ethAddress, ethSignature } = await signMessage(
    signableMessage,
    ethSigner
  );

  const prepareWithdrawalResponse = await withdrawalsApi.createWithdrawal({
    createWithdrawalRequest: {
      stark_key: assertIsDefined(signableWithdrawalResult.data.stark_key),
      amount: withdrawalAmount,
      asset_id: assertIsDefined(signableWithdrawalResult.data.asset_id),
      vault_id: assertIsDefined(signableWithdrawalResult.data.vault_id),
      nonce: assertIsDefined(signableWithdrawalResult.data.nonce),
      stark_signature: starkSignature,
    },
    xImxEthAddress: ethAddress,
    xImxEthSignature: ethSignature,
  });

  return prepareWithdrawalResponse.data;
}

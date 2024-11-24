import { imx } from '@imtbl/generated-clients';
import {
  TokenAmount,
  ImmutableXConfiguration,
} from '@imtbl/x-client';
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
  params: PrepareWithdrawalWorkflowParams,
  withdrawalsApi: imx.WithdrawalsApi,
): Promise<imx.CreateWithdrawalResponse> {
  const {
    signers: { ethSigner, starkSigner },
  } = params;
  await validateChain(ethSigner, params.config);
  const withdrawalAmount = params.type === 'ERC721' ? '1' : params.amount;
  const signableWithdrawalResult = await withdrawalsApi.getSignableWithdrawalV2(
    {
      getSignableWithdrawalRequest: {
        user: await ethSigner.getAddress(),
        token: convertToSignableToken(params),
        amount: withdrawalAmount,
      },
    },
  );

  const { signable_message: signableMessage, payload_hash: payloadHash } = signableWithdrawalResult.data;

  const starkSignature = await starkSigner.signMessage(payloadHash);

  const { ethAddress, ethSignature } = await signMessage(
    signableMessage,
    ethSigner,
  );

  const prepareWithdrawalResponse = await withdrawalsApi.createWithdrawalV2({
    createWithdrawalRequestV2: {
      sender_stark_key: assertIsDefined(
        signableWithdrawalResult.data.sender_stark_key,
      ),
      sender_vault_id: assertIsDefined(
        signableWithdrawalResult.data.sender_vault_id,
      ),
      receiver_stark_key: assertIsDefined(
        signableWithdrawalResult.data.receiver_stark_key,
      ),
      receiver_vault_id: assertIsDefined(
        signableWithdrawalResult.data.receiver_vault_id,
      ),
      amount: withdrawalAmount,
      asset_id: assertIsDefined(signableWithdrawalResult.data.asset_id),
      expiration_timestamp: assertIsDefined(
        signableWithdrawalResult.data.expiration_timestamp,
      ),
      nonce: assertIsDefined(signableWithdrawalResult.data.nonce),
      stark_signature: starkSignature,
    },
    xImxEthAddress: ethAddress,
    xImxEthSignature: ethSignature,
  });

  return prepareWithdrawalResponse.data;
}

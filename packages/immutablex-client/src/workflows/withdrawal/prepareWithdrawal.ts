import { WithdrawalsApi, CreateWithdrawalResponse } from '@imtbl/generated-clients/src/imx';

import { TokenAmount, WalletConnection } from '../../types';
import { signMessage } from '../../utils';
import { convertToSignableToken } from '../../utils/convertToSignableToken';

const assertIsDefined = <T>(value?: T): T => {
  if (value !== undefined) return value;
  throw new Error('undefined field exception');
};

type PrepareWithdrawalWorkflowParams = TokenAmount &
WalletConnection & {
  withdrawalsApi: WithdrawalsApi;
};

export async function prepareWithdrawalWorkflow(
  params: PrepareWithdrawalWorkflowParams,
): Promise<CreateWithdrawalResponse> {
  const { ethSigner, starkSigner, withdrawalsApi } = params;
  const withdrawalAmount = params.type === 'ERC721' ? '1' : params.amount;
  const signableWithdrawalResult = await withdrawalsApi.getSignableWithdrawal({
    getSignableWithdrawalRequest: {
      user: await ethSigner.getAddress(),
      token: convertToSignableToken(params),
      amount: withdrawalAmount,
    },
  });

  const { signable_message: signableMessage, payload_hash: payloadHash } = signableWithdrawalResult.data;

  const starkSignature = await starkSigner.signMessage(payloadHash);

  const { ethAddress, ethSignature } = await signMessage(
    signableMessage,
    ethSigner,
  );

  const prepareWithdrawalResponse = await withdrawalsApi.createWithdrawal({
    createWithdrawalRequest: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      stark_key: assertIsDefined(signableWithdrawalResult.data.stark_key),
      amount: withdrawalAmount,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      asset_id: assertIsDefined(signableWithdrawalResult.data.asset_id),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      vault_id: assertIsDefined(signableWithdrawalResult.data.vault_id),
      nonce: assertIsDefined(signableWithdrawalResult.data.nonce),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      stark_signature: starkSignature,
    },
    xImxEthAddress: ethAddress,
    xImxEthSignature: ethSignature,
  });

  return prepareWithdrawalResponse.data;
}

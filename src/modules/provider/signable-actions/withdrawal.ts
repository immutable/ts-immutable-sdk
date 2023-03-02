import { TokenAmount, AnyToken } from "src/types";
import { Signers } from "./types";
import { validateChain } from "./helpers";
import { Immutable } from "../../apis/starkex";
import {
  prepareWithdrawalAction,
  completeEthWithdrawalAction,
  completeERC20WithdrawalAction,
  completeERC721WithdrawalAction
} from "./withdrawal-actions";

type CompleteWithdrawalParams = {
  signers: Signers;
  starkPublicKey: string;
  token: AnyToken;
  client: Immutable;
}

type PrepareWithdrawalParams = {
  signers: Signers;
  withdrawal: TokenAmount;
  client:Immutable;
}

export async function prepareWithdrawal({
  signers,
  withdrawal,
  client,
}: PrepareWithdrawalParams) {
  const config = client.getConfiguration();
  await validateChain(signers.ethSigner, config);

  return prepareWithdrawalAction({
    signers,
    config,
    ...withdrawal,
  });
}

export async function completeWithdrawal({
  signers: { ethSigner },
  starkPublicKey,
  token,
  client,
}: CompleteWithdrawalParams) {
  await validateChain(ethSigner, client.getConfiguration());

  switch (token.type) {
    case 'ETH':
      return completeEthWithdrawalAction({ ethSigner, starkPublicKey, client });
    case 'ERC20':
      return completeERC20WithdrawalAction({ ethSigner, starkPublicKey, token, client });
    case 'ERC721':
      return completeERC721WithdrawalAction({ ethSigner, starkPublicKey, token, client });
  }
}

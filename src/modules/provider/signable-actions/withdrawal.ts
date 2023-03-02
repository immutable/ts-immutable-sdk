import { TokenAmount, AnyToken } from 'src/types';
import { Signers } from './types';
import { validateChain } from './helpers';
import { Configuration } from 'src/config';
import {
  prepareWithdrawalAction,
  completeEthWithdrawalAction,
  completeERC20WithdrawalAction,
  completeERC721WithdrawalAction,
} from './withdrawal-actions';

type CompleteWithdrawalParams = {
  signers: Signers;
  starkPublicKey: string;
  token: AnyToken;
  config: Configuration;
};

type PrepareWithdrawalParams = {
  signers: Signers;
  withdrawal: TokenAmount;
  config: Configuration;
};

export async function prepareWithdrawal({
  signers,
  withdrawal,
  config,
}: PrepareWithdrawalParams) {
  const starkExConfig = config.getStarkExConfig();
  await validateChain(signers.ethSigner, starkExConfig);

  return prepareWithdrawalAction({
    signers,
    config: starkExConfig,
    ...withdrawal,
  });
}

export async function completeWithdrawal({
  signers: { ethSigner },
  starkPublicKey,
  token,
  config,
}: CompleteWithdrawalParams) {
  await validateChain(ethSigner, config.getStarkExConfig());

  switch (token.type) {
    case 'ETH':
      return completeEthWithdrawalAction({ ethSigner, starkPublicKey, config });
    case 'ERC20':
      return completeERC20WithdrawalAction({
        ethSigner,
        starkPublicKey,
        token,
        config,
      });
    case 'ERC721':
      return completeERC721WithdrawalAction({
        ethSigner,
        starkPublicKey,
        token,
        config,
      });
  }
}

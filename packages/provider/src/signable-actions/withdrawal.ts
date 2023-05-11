import { TokenAmount, AnyToken } from '@imtbl/core-sdk';
import { ProviderConfiguration } from 'config';
import { Signers } from './types';
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
  config: ProviderConfiguration;
};

type PrepareWithdrawalParams = {
  signers: Signers;
  withdrawal: TokenAmount;
  config: ProviderConfiguration;
};

export async function prepareWithdrawal({
  signers,
  withdrawal,
  config,
}: PrepareWithdrawalParams) {
  return prepareWithdrawalAction({
    signers,
    config: config.immutableXConfig,
    ...withdrawal,
  });
}

export async function completeWithdrawal({
  signers: { ethSigner },
  starkPublicKey,
  token,
  config,
}: CompleteWithdrawalParams) {
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

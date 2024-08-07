import { imx } from '@imtbl/generated-clients';
import { AnyToken, TokenAmount } from '@imtbl/x-client';
import { ProviderConfiguration } from '../config';
import { Signers } from './types';
import {
  completeEthWithdrawalAction,
  completeERC20WithdrawalAction,
  completeERC721WithdrawalAction,
  prepareWithdrawalAction,
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
  const withdrawalsApi = new imx.WithdrawalsApi(config.immutableXConfig.apiConfiguration);
  return prepareWithdrawalAction({
    signers,
    config: config.immutableXConfig,
    ...withdrawal,
  }, withdrawalsApi);
}

// TODO: remove once fixed
// eslint-disable-next-line consistent-return
export async function completeWithdrawal({
  signers: { ethSigner, starkSigner },
  starkPublicKey,
  token,
  config,
}: CompleteWithdrawalParams) {
  const mintsApi = new imx.MintsApi(config.immutableXConfig.apiConfiguration);

  // eslint-disable-next-line default-case
  switch (token.type) {
    case 'ETH':
      return completeEthWithdrawalAction({
        ethSigner, starkSigner, starkPublicKey, config,
      });
    case 'ERC20':
      return completeERC20WithdrawalAction({
        ethSigner,
        starkSigner,
        starkPublicKey,
        token,
        config,
      });
    case 'ERC721':
      return completeERC721WithdrawalAction({
        ethSigner,
        starkSigner,
        starkPublicKey,
        token,
        config,
      }, mintsApi);
  }
}

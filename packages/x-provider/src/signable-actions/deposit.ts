import { TokenAmount } from '@imtbl/core-sdk';
import { Signers } from './types';
import { depositEth, depositERC20, depositERC721 } from './deposit-actions';
import { ProviderConfiguration } from '../config';

type DepositParams = {
  signers: Signers;
  deposit: TokenAmount;
  config: ProviderConfiguration;
};

// TODO: remove once fixed deposit variable shadowing
// eslint-disable-next-line consistent-return, @typescript-eslint/no-shadow
export async function deposit({ signers, deposit, config }: DepositParams) {
  // TODO: please add a reasonable default here
  // eslint-disable-next-line default-case
  switch (deposit.type) {
    case 'ETH':
      return depositEth({ signers, deposit, config });
    case 'ERC20':
      return depositERC20({ signers, deposit, config });
    case 'ERC721':
      return depositERC721({ signers, deposit, config });
  }
}

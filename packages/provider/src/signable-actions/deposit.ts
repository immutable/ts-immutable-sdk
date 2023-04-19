import { TokenAmount } from '@imtbl/core-sdk';
import { Signers } from './types';
import { depositEth, depositERC20, depositERC721 } from './deposit-actions';
import { ProviderConfiguration } from '../config';

type DepositParams = {
  signers: Signers;
  deposit: TokenAmount;
  config: ProviderConfiguration;
};

export async function deposit({ signers, deposit, config }: DepositParams) {
  switch (deposit.type) {
    case 'ETH':
      return depositEth({ signers, deposit, config });
    case 'ERC20':
      return depositERC20({ signers, deposit, config });
    case 'ERC721':
      return depositERC721({ signers, deposit, config });
  }
}

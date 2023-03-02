import { TokenAmount } from 'src/types';
import { Configuration } from 'src/config';
import { Signers } from './types';
import { depositEth, depositERC20, depositERC721 } from './deposit-actions';

export async function deposit(
  signers: Signers,
  deposit: TokenAmount,
  config: Configuration,
) {
  switch (deposit.type) {
    case 'ETH':
      return depositEth(signers.ethSigner, deposit, config);
    case 'ERC20':
      return depositERC20(signers.ethSigner, deposit, config);
    case 'ERC721':
      return depositERC721(signers.ethSigner, deposit, config);
  }
}

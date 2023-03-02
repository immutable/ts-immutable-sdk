import { TokenAmount } from 'src/types';
import { Signers } from './types';
import { Configuration } from 'src/config/config';
import { depositEth, depositERC20, depositERC721 } from './deposit-actions';

export async function deposit(
  signers: Signers,
  deposit: TokenAmount,
  imx: Configuration
) {
  switch (deposit.type) {
    case 'ETH':
      return depositEth(signers.ethSigner, deposit, imx);
    case 'ERC20':
      return depositERC20(signers.ethSigner, deposit, imx);
    case 'ERC721':
      return depositERC721(signers.ethSigner, deposit, imx);
  }
}

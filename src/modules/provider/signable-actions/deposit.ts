import { TokenAmount } from "src/types";
import { Signers } from "./types";
import { validateChain } from "./helpers";
import { Immutable } from "../../apis/starkex";
import { depositEth, depositERC20, depositERC721 } from "./deposit-actions";

export async function deposit(signers: Signers, deposit: TokenAmount, imx:Immutable) {
  await validateChain(signers.ethSigner, imx.getConfiguration());

  switch (deposit.type) {
    case 'ETH':
      return depositEth(signers.ethSigner, deposit, imx);
    case 'ERC20':
      return depositERC20(signers.ethSigner, deposit, imx);
    case 'ERC721':
      return depositERC721(signers.ethSigner, deposit, imx);
  }
}

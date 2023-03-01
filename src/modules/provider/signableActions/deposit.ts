import { TokenAmount } from "src/types";
import { Signers } from "./types";
import { validateChain } from "./helpers";
import { Immutable } from "../../apis/starkex";
import { depositEth, depositERC20 } from "./deposit/index";

export async function deposit(signer: Signers, deposit: TokenAmount, imx:Immutable) {
  await validateChain(signer.ethSigner, imx.getConfiguration());

  switch (deposit.type) {
    case 'ETH':
      return depositEth(signer.ethSigner, deposit, imx);
    case 'ERC20':
      return depositERC20(signer.ethSigner, deposit, imx);
    // case 'ERC721':
    //   return depositERC721(signer.ethSigner, deposit);
  }
}

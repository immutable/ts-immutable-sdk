import { TokenAmount } from "types";
import { Signers } from "./types";
import { Configuration } from "@imtbl/config";
import { depositEth, depositERC20, depositERC721 } from "./deposit-actions";

type DepositParams = {
  signers: Signers;
  deposit: TokenAmount;
  config: Configuration;
};

export async function deposit({ signers, deposit, config }: DepositParams) {
  switch (deposit.type) {
    case "ETH":
      return depositEth({ signers, deposit, config });
    case "ERC20":
      return depositERC20({ signers, deposit, config });
    case "ERC721":
      return depositERC721({ signers, deposit, config });
  }
}

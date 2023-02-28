import { EthSigner, StarkSigner } from "@imtbl/core-sdk";
import { Signers } from "./signableActions/types";
import { RegisterUserResponse } from "../../types";
import { IMXProvider } from "./imxProvider";
import { registerOffchain } from "./signableActions/registration";
import { Immutable } from "../apis/starkex/immutable";


// Usage of Immutable to create GenericProvider and use it in workflows
class GenericProvider implements IMXProvider {
  private imx: Immutable;
  private signers: Signers;

  constructor(imx: Immutable, ethSigner: EthSigner, starkExSigner: StarkSigner) {
    this.imx = imx;
    this.signers = { ethSigner, starkExSigner };
  }

  registerOffchain(): Promise<RegisterUserResponse> {
    return registerOffchain(this.signers, this.imx)
  }
}

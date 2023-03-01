// import { IMXProvider } from "./imxProvider";
// import { Immutable } from "../apis/starkex";
// import { Signers } from "./signable-actions/types";
// import { RegisterUserResponse, StarkSigner } from "src/types";
// import { EthSigner } from "@imtbl/core-sdk";
// import { registerOffchain as registerOffchainAction } from "./signable-actions/registration";
//
// class GenericProvider implements IMXProvider {
//   private imx: Immutable;
//   private signers: Signers;
//
//   constructor(imx: Immutable, ethSigner: EthSigner, starkExSigner: StarkSigner) {
//     this.imx = imx;
//     this.signers = { ethSigner, starkExSigner };
//   }
//
//   registerOffchain(): Promise<RegisterUserResponse> {
//     return registerOffchainAction(this.signers, this.imx)
//   }
// }

// import { IMXProvider } from "./imxProvider";
// import { ImmutableX } from "../apis/starkex";
// import { Signers } from "./signableActions/types";
// import { RegisterUserResponse, StarkSigner } from "src/types";
// import { EthSigner } from "@imtbl/core-sdk";
// import { registerOffchain as registerOffchainAction } from "./signableActions/registration";
//
// class GenericProvider implements IMXProvider {
//   private imx: ImmutableX;
//   private signers: Signers;
//
//   constructor(imx: ImmutableX, ethSigner: EthSigner, starkExSigner: StarkSigner) {
//     this.imx = imx;
//     this.signers = { ethSigner, starkExSigner };
//   }
//
//   registerOffchain(): Promise<RegisterUserResponse> {
//     return registerOffchainAction(this.signers, this.imx)
//   }
// }

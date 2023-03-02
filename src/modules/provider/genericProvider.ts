// import { IMXProvider } from "./imxProvider";
// import { Configuration } from "config";
// import { Signers } from "./signable-actions/types";
// import { RegisterUserResponse, StarkSigner } from "types";
// import { EthSigner } from "@imtbl/core-sdk";
// import { registerOffchain as registerOffchainAction } from "./signable-actions/registration";
//
// class GenericProvider implements IMXProvider {
//   private config: Configuration;
//   private signers: Signers;
//
//   constructor(config: Configuration, ethSigner: EthSigner, starkExSigner: StarkSigner) {
//     this.config = config;
//     this.signers = { ethSigner, starkExSigner };
//   }
//
//   registerOffchain(): Promise<RegisterUserResponse> {
//     return registerOffchainAction(this.signers, this.config)
//   }
// }

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
//     return registerOffchain(this.signers, this.imx)
//   }
// }

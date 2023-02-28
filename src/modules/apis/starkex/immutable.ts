import { ImmutableX, ImmutableXConfiguration } from "@imtbl/core-sdk";

export class Immutable {
  private readonly config: ImmutableXConfiguration;
  public StarkExAPI: any;

  constructor(config: ImmutableXConfiguration) {
    this.config = config;

    const imx = new ImmutableX(config); // coresdk

    const {
      deposit,
      registerOffchain,
      isRegisteredOnchain,
      prepareWithdrawal,
      completeWithdrawal,
      createOrder,
      cancelOrder,
      createTrade,
      transfer,
      batchNftTransfer,
      ...StarkEx
    } = imx;
    this.StarkExAPI = StarkEx;
  }

  public getConfig(): ImmutableXConfiguration {
    return this.config;
  }
}

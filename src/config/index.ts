import {
  ImmutableXConfiguration as StarkExConfig,
} from "@imtbl/core-sdk";

export class Configuration {
  private readonly starkExConfig: StarkExConfig;

  constructor(config: StarkExConfig) {
    this.starkExConfig = config;
  }
  public getStarkExConfig(): StarkExConfig {
    return this.starkExConfig;
  }
}


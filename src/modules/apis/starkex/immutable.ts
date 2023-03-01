import {
  ImmutableXConfiguration as imtblConfig,
} from "@imtbl/core-sdk";

export class Immutable {
  private readonly config: imtblConfig;

  constructor(config: imtblConfig) {
    this.config = config;
  }
  public getConfiguration(): imtblConfig {
    return this.config;
  }

}


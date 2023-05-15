import { Service } from 'typedi';

import {
  Environment,
  ModuleConfiguration as ImmutableModuleConfiguration,
} from '@imtbl/config';
import { IMXProvider } from '@imtbl/provider';

export interface Configuration {
  gameId: string;
  userId: string;
  walletAddress: string;
  imxProvider?: IMXProvider;
}

export interface ModuleConfiguration
  extends ImmutableModuleConfiguration<Configuration> {}

export const defaultConfig: ModuleConfiguration = {
  baseConfig: {
    environment: Environment.SANDBOX,
  },
};

export class ConfigurtionError extends Error {
  public message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}
@Service()
export class Config {
  readonly environment: Environment;

  readonly gameId: string;

  readonly userId: string;

  readonly walletAddress: string;

  readonly imxProvider?: IMXProvider;

  constructor(config: ModuleConfiguration = defaultConfig) {
    const envKeys = Object.values(Environment);
    if (!envKeys.includes(config.baseConfig.environment)) {
      throw new ConfigurtionError(
        `Invalid environment key, must be one of ${envKeys}`,
      );
    }

    this.environment = config.baseConfig.environment;
    this.gameId = config.overrides?.gameId || '';
    this.userId = config.overrides?.userId || '';
    this.walletAddress = config.overrides?.walletAddress || '';
    this.imxProvider = config.overrides?.imxProvider;
  }

  public set(configuration: Partial<Configuration>): void {
    Object.entries(configuration as Configuration).forEach(([key, value]) => {
      if (key in this && key !== 'config') {
        this[key as keyof this] = value;
      }
    });
  }

  public get() {
    return {
      environment: this.environment,
      gameId: this.gameId,
      userId: this.userId,
      walletAddress: this.walletAddress,
      imxProvider: this.imxProvider,
    };
  }
}

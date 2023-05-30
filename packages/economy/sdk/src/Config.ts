import { Service } from 'typedi';

import { Environment, ModuleConfiguration } from '@imtbl/config';
import { IMXProvider } from '@imtbl/provider';

export interface Overrides {
  environment?: Environment;
  servicesBaseURL?: string;
}

export interface EconomyModuleConfiguration
  extends ModuleConfiguration<Overrides> {
  gameId: string;
  userId: string;
  walletAddress: string;
  imxProvider?: IMXProvider;
}

export const defaultConfig: EconomyModuleConfiguration = {
  baseConfig: {
    environment: Environment.SANDBOX,
  },
  gameId: '',
  userId: '',
  walletAddress: '',
  imxProvider: undefined,
};

export class ConfigurationError extends Error {
  public message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

const PROD_BASE_URL = 'https://api.games.immutable.com';

const SANDBOX_BASE_URL = 'https://api.sandbox.games.immutable.com';

@Service()
export class Config {
  readonly environment: Environment;

  readonly servicesBaseURL!: string;

  constructor(readonly config: EconomyModuleConfiguration) {
    const envKeys = Object.values(Environment);
    if (!envKeys.includes(config.baseConfig.environment)) {
      throw new ConfigurationError(
        `Invalid environment key, must be one of ${envKeys}`,
      );
    }

    this.environment = config?.overrides?.environment || config.baseConfig.environment;

    if (this.environment === Environment.PRODUCTION) {
      this.servicesBaseURL = PROD_BASE_URL;
    }

    if (this.environment === Environment.SANDBOX) {
      this.servicesBaseURL = SANDBOX_BASE_URL;
    }

    if (config.overrides?.servicesBaseURL) {
      this.servicesBaseURL = config.overrides.servicesBaseURL;
    }
  }

  public set(config: Partial<EconomyModuleConfiguration>): void {
    Object.entries(config as EconomyModuleConfiguration).forEach(
      ([key, value]) => {
        if (key in this.config && key !== 'overrides') {
          this.config[key as keyof EconomyModuleConfiguration] = value;
        }
      },
    );
  }

  public get() {
    const { overrides, ...rest } = this.config;

    return {
      environment: this.environment,
      ...rest,
    };
  }
}

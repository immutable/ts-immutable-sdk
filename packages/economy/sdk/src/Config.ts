import Container, { Service } from 'typedi';

/** @public Standard SDK Configuration interface */
export type Configuration = {
  env: 'production' | 'dev';
};

export const defaultConfig: Configuration = {
  env: 'dev',
};

@Service()
export class Config {
  private config: Configuration = defaultConfig;

  constructor(config: Configuration = defaultConfig) {
    this.set(config);
  }

  public set(config: Configuration): void {
    this.config = config;
  }

  public get(): Configuration {
    return this.config;
  }
}

Container.set('SDKConfig', defaultConfig);

export enum Environment {
  SANDBOX = 'sandbox',
  PRODUCTION = 'production',
}

export interface Configuration {
  environment: Environment;
  overrides?: Object;
}

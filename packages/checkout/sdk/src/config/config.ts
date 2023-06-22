import { Environment } from '@imtbl/config';
import {
  CheckoutModuleConfiguration, NetworkMap, PRODUCTION_CHAIN_ID_NETWORK_MAP, SANDBOX_CHAIN_ID_NETWORK_MAP,
} from '../types';

export class CheckoutConfigurationError extends Error {
  public message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class CheckoutConfiguration {
  readonly environment: Environment;

  readonly networkMap: NetworkMap;

  constructor(config: CheckoutModuleConfiguration) {
    // validate input
    if (!Object.values(Environment).includes(config.baseConfig.environment)) {
      throw new CheckoutConfigurationError('Invalid checkout configuration of environment');
    }
    this.environment = config.baseConfig.environment;
    this.networkMap = config.baseConfig.environment === Environment.PRODUCTION
      ? PRODUCTION_CHAIN_ID_NETWORK_MAP
      : SANDBOX_CHAIN_ID_NETWORK_MAP;
  }
}

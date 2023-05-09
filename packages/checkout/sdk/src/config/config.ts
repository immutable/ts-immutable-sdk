import { Environment } from '@imtbl/config';
import { NetworkDetails, NetworkMap, ProductionChainIdNetworkMap, SandboxChainIdNetworkMap } from '../types';

export interface CheckoutConfig {
  environment: Environment
}

export class CheckoutConfiguration {
  readonly environment: Environment;
  readonly networkMap: NetworkMap;

  constructor(config: CheckoutConfig) {
    // validate input
    if(!Object.values(Environment).includes(config.environment)){
      throw new CheckoutConfigurtionError("Invalid checkout configuration of environment");
    }
    this.environment = config.environment;
    this.networkMap = config.environment === Environment.PRODUCTION 
    ? ProductionChainIdNetworkMap 
    : SandboxChainIdNetworkMap;
  }
}

export class CheckoutConfigurtionError extends Error {
  public message: string;
  constructor(message: string){
    super(message);
    this.message = message;
  }
}
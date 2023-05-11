import { Environment } from '@imtbl/config';
import { CheckoutModuleConfiguration, NetworkMap, ProductionChainIdNetworkMap, SandboxChainIdNetworkMap } from '../types';

export class CheckoutConfiguration {
  readonly environment: Environment;
  readonly networkMap: NetworkMap;

  constructor(config: CheckoutModuleConfiguration) {
    // validate input
    if(!Object.values(Environment).includes(config.baseConfig.environment)){
      throw new CheckoutConfigurtionError("Invalid checkout configuration of environment");
    }
    this.environment = config.baseConfig.environment;
    this.networkMap = config.baseConfig.environment === Environment.PRODUCTION 
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
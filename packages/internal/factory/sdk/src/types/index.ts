import { ModuleConfiguration } from '@imtbl/config';
import { ethers } from 'ethers';

export type FactoryInstance = {
  chainID: string;
  factory: Address;
};

export interface FactoryModuleConfiguration
  extends ModuleConfiguration<FactoryInstance> {
  factoryInstance: FactoryInstance;
  provider: ethers.providers.Provider;
}

/**
 * @typedef {string} Address - Represents an Ethereum address.
 */
export type Address = string;

import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ethers } from 'ethers';
import {
  ZKEVM_DEVNET,
  ZKEVM_TESTNET,
} from '../constants/factory';
import {
  FactoryInstance, FactoryModuleConfiguration,
} from '../types';

const SUPPORTED_SANDBOX_FACTORIES: FactoryInstance[] = [ZKEVM_DEVNET, ZKEVM_TESTNET];

// TODO: Add when supported
const SUPPORTED_PRODUCTION_FACTORIES: FactoryInstance[] = [];

export const SUPPORTED_FACTORIES_FOR_ENVIRONMENT: {
  [key in Environment]: FactoryInstance[];
} = {
  [Environment.SANDBOX]: SUPPORTED_SANDBOX_FACTORIES,
  [Environment.PRODUCTION]: SUPPORTED_PRODUCTION_FACTORIES,
};

export class FactoryConfiguration {
  public baseConfig: ImmutableConfiguration;

  public factoryInstance: FactoryInstance;

  public provider: ethers.providers.Provider;

  constructor({
    factoryInstance,
    provider,
    baseConfig,
    overrides,
  }: FactoryModuleConfiguration) {
    this.baseConfig = baseConfig;
    this.factoryInstance = factoryInstance;
    this.provider = provider;

    if (overrides) {
      this.factoryInstance = { factory: overrides.factory, chainID: overrides.chainID };
      return;
    }

    const supported = SUPPORTED_FACTORIES_FOR_ENVIRONMENT[baseConfig.environment].includes(
      factoryInstance,
    );

    if (!supported) {
      throw new Error(
        `Factory instance with chainID ${factoryInstance.chainID} and address ${factoryInstance.factory} is not supported in environment ${baseConfig.environment}`,
      );
    }
  }
}

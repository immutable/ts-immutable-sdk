import {
  ZKEVM_DEVNET,
  ZKEVM_TESTNET,
} from 'constants/factory';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ethers } from 'ethers';
import {
  FactoryInstance, FactoryModuleConfiguration,
} from '../types';

const SUPPORTED_SANDBOX_BRIDGES: FactoryInstance[] = [ZKEVM_DEVNET, ZKEVM_TESTNET];

// TODO: Add when supported
const SUPPORTED_PRODUCTION_BRIDGES: FactoryInstance[] = [];

export const SUPPORTED_BRIDGES_FOR_ENVIRONMENT: {
  [key in Environment]: FactoryInstance[];
} = {
  [Environment.SANDBOX]: SUPPORTED_SANDBOX_BRIDGES,
  [Environment.PRODUCTION]: SUPPORTED_PRODUCTION_BRIDGES,
};

export class FactoryConfiguration {
  public baseConfig: ImmutableConfiguration;

  public factoryInstance: FactoryInstance;

  public provider: ethers.providers.Provider;

  /**
   * Constructs a BridgeConfiguration instance.
   *
   * @param {FactoryModuleConfiguration} options - The configuration options for the bridge module.
   */
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

    const supported = SUPPORTED_BRIDGES_FOR_ENVIRONMENT[baseConfig.environment].includes(
      factoryInstance,
    );

    if (!supported) {
      throw new Error(
        `Factory instance with chainID ${factoryInstance.chainID} and address ${factoryInstance.factory} is not supported in environment ${baseConfig.environment}`,
      );
    }
  }
}

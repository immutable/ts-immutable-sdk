import { describe, expect, it } from '@jest/globals';
import { DexModuleConfiguration } from '../types';
import { Environment, ImmutableConfiguration } from '@imtbl/config/src';
import { DexConfiguration } from './config';
import { POLYGON_TESTNET_CHAIN_ID } from '../constants/tokens/polygon';
describe('config', () => {
  it('should create successfully', () => {
    const dexConfiguration: DexModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      overrides: {
        chainId: POLYGON_TESTNET_CHAIN_ID,
      },
    };

    const config = new DexConfiguration(dexConfiguration);
    expect(config.chainId).toBe(POLYGON_TESTNET_CHAIN_ID);
    expect(config.baseConfig.environment).toBe(Environment.SANDBOX);
  });

  it('throw error if no chainId provided', () => {
    const dexConfiguration: DexModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
    };

    expect(() => new DexConfiguration(dexConfiguration)).toThrow(
      new Error('overrides - chainId cannot be null or empty')
    );
  });

  it('throw error if incorrect chainId provided', () => {
    const dexConfiguration: DexModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      overrides: {
        chainId: 1,
      },
    };

    expect(() => new DexConfiguration(dexConfiguration)).toThrow(
      new Error('overrides - we only support Polygon Testnet Chain Id: 1442')
    );
  });
});

import { describe, expect, it } from '@jest/globals';
import { ExchangeModuleConfiguration } from '../types';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ExchangeConfiguration } from './index';
import { POLYGON_TESTNET_CHAIN_ID } from '../constants/tokens/polygon';
describe('config', () => {
  it('should create successfully', () => {
    const exchangeConfiguration: ExchangeModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      chainId: POLYGON_TESTNET_CHAIN_ID,
    };

    const config = new ExchangeConfiguration(exchangeConfiguration);
    expect(config.chain.chainId).toBe(POLYGON_TESTNET_CHAIN_ID);
    expect(config.baseConfig.environment).toBe(Environment.SANDBOX);
  });

  it('throw error if incorrect chainId provided', () => {
    const exchangeConfiguration: ExchangeModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      chainId: 1,
    };

    expect(() => new ExchangeConfiguration(exchangeConfiguration)).toThrow(
      new Error('Chain 1 is not supported in environment sandbox')
    );
  });
});

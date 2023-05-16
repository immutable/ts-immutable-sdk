import { describe, expect, it } from '@jest/globals';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ChainNotSupportedError } from 'errors';
import { ExchangeModuleConfiguration } from '../types';
import { ExchangeConfiguration } from './index';
import { POLYGON_TESTNET_CHAIN_ID } from '../constants/tokens/polygon';

describe('config', () => {
  it('should create successfully', () => {
    const baseConfig = new ImmutableConfiguration({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      environment: Environment.SANDBOX,
    });
    const exchangeConfiguration: ExchangeModuleConfiguration = {
      baseConfig,
      chainId: POLYGON_TESTNET_CHAIN_ID,
    };

    const config = new ExchangeConfiguration(exchangeConfiguration);
    expect(config.chain.chainId).toBe(POLYGON_TESTNET_CHAIN_ID);
    expect(config.baseConfig.environment).toBe(Environment.SANDBOX);
  });

  it('throw ChainNotSupportedError', () => {
    const baseConfig = new ImmutableConfiguration({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      environment: Environment.SANDBOX,
    });
    const exchangeConfiguration: ExchangeModuleConfiguration = {
      baseConfig,
      chainId: 1,
    };

    expect(() => new ExchangeConfiguration(exchangeConfiguration)).toThrow(
      new ChainNotSupportedError(1, Environment.SANDBOX),
    );
  });
});

import { describe, expect, it } from '@jest/globals';
import { Environment } from '@imtbl/config';
import { CryptoFiatModuleConfiguration } from '../types';
import { CryptoFiatConfiguration } from './index';

describe('config', () => {
  it('should create with correct env', () => {
    const cryptoFiatConfiguration: CryptoFiatModuleConfiguration = {
      baseConfig: {
        environment: Environment.SANDBOX,
      },
    };

    const config = new CryptoFiatConfiguration(cryptoFiatConfiguration);
    expect(config.baseConfig.environment).toBe(Environment.SANDBOX);
  });
});

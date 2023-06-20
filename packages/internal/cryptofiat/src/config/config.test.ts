import { describe, expect, it } from '@jest/globals';
import { CryptoFiatModuleConfiguration } from 'types';
import { CryptoFiatConfiguration } from 'config';
import { Environment } from '@imtbl/config';

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

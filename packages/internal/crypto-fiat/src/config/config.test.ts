import { describe, expect, it } from '@jest/globals';
import { CryptoFiatModuleConfiguration } from 'types';
import { CryptoFiatConfiguration } from 'config';

describe('config', () => {
  it('should create successfully with API key', () => {
    const apiKey = 'test-api-key';
    const cryptoFiatConfiguration: CryptoFiatModuleConfiguration = {
      apiKey: apiKey,
    };

    const config = new CryptoFiatConfiguration(cryptoFiatConfiguration);
    expect(config.getApiKey()).toBe(apiKey);
  });

  it('should create successfully with empty API key', () => {
    const cryptoFiatConfiguration: CryptoFiatModuleConfiguration = {};

    const config = new CryptoFiatConfiguration(cryptoFiatConfiguration);
    expect(config.getApiKey()).toBe(undefined);
  });
});

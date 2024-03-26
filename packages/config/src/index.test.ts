import {
  Environment,
  ImmutableConfiguration,
  KeyHeaders,
  addKeysToHeadersOverride,
} from './index';

describe('Key header override', () => {
  const apiKey = 'testKey';
  const publishableKey = 'testPublishableKey';
  const rateLimitingKey = 'testRateLimitKey';

  it('should return passed in override if no base config is present', () => {
    const overrides = {
      headers: {
        testHeader: 'test',
      },
    };

    const result = addKeysToHeadersOverride(undefined, overrides);
    expect(result).toEqual(overrides);
  });

  it('should return passed in override if no keys are present', () => {
    const baseConfig = new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    });
    const overrides = {
      headers: {
        testHeader: 'test',
      },
    };

    const result = addKeysToHeadersOverride(baseConfig, overrides);
    expect(result).toEqual(overrides);
  });

  it('Should append headers to override', () => {
    const baseConfig = new ImmutableConfiguration({
      environment: Environment.SANDBOX,
      apiKey,
      rateLimitingKey,
      publishableKey,
    });

    const overrides = {
      headers: {
        [KeyHeaders.API_KEY]: apiKey,
        [KeyHeaders.RATE_LIMITING_KEY]: rateLimitingKey,
        [KeyHeaders.PUBLISHABLE_KEY]: publishableKey,
      },
    };

    const result = addKeysToHeadersOverride(baseConfig, overrides);
    expect(result).toEqual(overrides);
  });

  it('Should merge headers with existing overrides, with user overrides taking precedence', () => {
    const baseConfig = new ImmutableConfiguration({
      environment: Environment.SANDBOX,
      apiKey,
      rateLimitingKey,
      publishableKey,
    });

    const overrides = {
      headers: {
        [KeyHeaders.API_KEY]: 'userOverriddenApiKey',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'new-header': 'test',
      },
    };
    const expectedOverrides = {
      headers: {
        [KeyHeaders.API_KEY]: 'userOverriddenApiKey',
        [KeyHeaders.RATE_LIMITING_KEY]: rateLimitingKey,
        [KeyHeaders.PUBLISHABLE_KEY]: publishableKey,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'new-header': 'test',
      },
    };

    const result = addKeysToHeadersOverride(baseConfig, overrides);

    expect(result).toEqual(expectedOverrides);
  });
});

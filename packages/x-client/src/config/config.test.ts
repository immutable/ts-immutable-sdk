/* eslint-disable @typescript-eslint/naming-convention */
import { imx } from '@imtbl/generated-clients';
import {
  createConfig,
  ImmutableXConfiguration,
  ImxConfiguration,
  Environment,
  imxClientConfig,
} from './index';

const defaultHeaders = { 'x-sdk-version': 'ts-immutable-sdk-__SDK_VERSION__' };

describe('createConfig', () => {
  it('should throw if basePath is whitespace', () => {
    expect(() => createConfig({
      coreContractAddress: '0x1',
      registrationContractAddress: '0x2',
      chainID: 3,
      basePath: ' ',
    })).toThrowError('basePath can not be empty');
  });

  it('should throw if basePath is empty', () => {
    expect(() => createConfig({
      coreContractAddress: '0x1',
      registrationContractAddress: '0x2',
      chainID: 3,
      basePath: '',
    })).toThrowError('basePath can not be empty');
  });

  it('should return config', () => {
    const basePath = 'https://api.sandbox.x.immutable.com';
    const coreContractAddress = '0x1';
    const registrationContractAddress = '0x2';
    const chainID = 3;
    const customHeaders = {
      'x-custom-headers': 'x values',
      'x-sdk-version': 'this should get overwritten',
    };
    const expected: ImmutableXConfiguration = {
      apiConfiguration: new imx.Configuration({
        basePath,
        baseOptions: {
          headers: { 'x-custom-headers': 'x values', ...defaultHeaders },
        },
      }),
      ethConfiguration: {
        chainID,
        coreContractAddress,
        registrationContractAddress,
      },
    };

    const actual = createConfig({
      coreContractAddress,
      registrationContractAddress,
      chainID,
      basePath,
      headers: customHeaders,
    });
    expect(actual).toEqual(expected);
  });

  it('config should return sdkVersion thats provided', () => {
    const sdkVersion = 'ts-immutable-sdk-test-1.0.0';

    const basePath = 'https://api.sandbox.x.immutable.com';
    const coreContractAddress = '0x1';
    const registrationContractAddress = '0x2';
    const chainID = 3;
    const customHeaders = {
      'x-custom-headers': 'x values',
      'x-sdk-version': 'this should get overwritten',
    };
    const expected: ImmutableXConfiguration = {
      apiConfiguration: new imx.Configuration({
        basePath,
        baseOptions: {
          headers: {
            'x-custom-headers': 'x values',
            'x-sdk-version': sdkVersion,
          },
        },
      }),
      ethConfiguration: {
        chainID,
        coreContractAddress,
        registrationContractAddress,
      },
    };

    const actual = createConfig({
      coreContractAddress,
      registrationContractAddress,
      chainID,
      basePath,
      headers: customHeaders,
      sdkVersion,
    });
    expect(actual).toEqual(expected);
  });
});

describe('imxClientConfig', () => {
  it('should return an instance of ImxConfiguration', () => {
    const config = imxClientConfig({
      environment: Environment.SANDBOX,
    });
    expect(config).toHaveProperty('baseConfig');
    expect(config.baseConfig).toHaveProperty('environment', 'sandbox');
  });

  it('should throw when missing the config options', () => {
    // @ts-expect-error
    expect(() => imxClientConfig()).toThrowError('configOptions is required');
  });

  it('should throw when the Enironment parameter is not a valid Environment', () => {
    // @ts-expect-error
    expect(() => imxClientConfig({ environment: 'invalid' }))
      .toThrowError('Invalid environment: invalid');
  });

  it('should set the APIs keys in the ImmutableConfiguration base config', () => {
    const apiKey = 'api-key';
    const publishableKey = 'publishable-key';
    const rateLimitingKey = 'rate-limit-key';

    const config = imxClientConfig({
      environment: Environment.SANDBOX,
      apiKey,
      publishableKey,
      rateLimitingKey,
    });

    expect(config.baseConfig.apiKey).toBe(apiKey);
    expect(config.baseConfig.publishableKey).toBe(publishableKey);
    expect(config.baseConfig.rateLimitingKey).toBe(rateLimitingKey);
  });
});

describe('ImxConfiguration', () => {
  it('should set apiConfiguration basePath, baseOptions, and headers when used with imxClientConfig', () => {
    const apiKey = 'api-key';
    const publishableKey = 'publishable-key';
    const rateLimitingKey = 'rate-limit-key';

    const config = imxClientConfig({
      environment: Environment.SANDBOX,
      apiKey,
      publishableKey,
      rateLimitingKey,
    });

    const imxConfig = new ImxConfiguration(config);

    expect(imxConfig.immutableXConfig.apiConfiguration).toMatchObject({
      basePath: 'https://api.sandbox.x.immutable.com',
      baseOptions: {
        headers: {
          'x-sdk-version': 'ts-immutable-sdk-__SDK_VERSION__',
          'x-immutable-api-key': apiKey,
          'x-immutable-publishable-key': publishableKey,
          'x-api-key': rateLimitingKey,
        },
      },
    });
  });
});

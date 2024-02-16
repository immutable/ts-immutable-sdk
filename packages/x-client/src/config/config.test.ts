/* eslint-disable @typescript-eslint/naming-convention */
import { imx } from '@imtbl/generated-clients';
import {
  Config,
  ImmutableXConfiguration,
  Environment,
  imxClientConfig,
} from './index';

const defaultHeaders = { 'x-sdk-version': 'ts-immutable-sdk-__SDK_VERSION__' };

describe('createConfig', () => {
  it('should throw if basePath is whitespace', () => {
    expect(() => Config.createConfig({
      coreContractAddress: '0x1',
      registrationContractAddress: '0x2',
      chainID: 3,
      basePath: ' ',
    })).toThrowError('basePath can not be empty');
  });

  it('should throw if basePath is empty', () => {
    expect(() => Config.createConfig({
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

    const actual = Config.createConfig({
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

    const actual = Config.createConfig({
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
    const config = imxClientConfig(Environment.SANDBOX);
    expect(config).toHaveProperty('baseConfig');
    expect(config.baseConfig).toHaveProperty('environment', 'sandbox');
  });

  it('should throw when missing the Enironment parameter', () => {
    // @ts-expect-error
    expect(() => imxClientConfig()).toThrowError('Environment is required');
  });

  it('should throw when the Enironment parameter is not a valid Environment', () => {
    // @ts-expect-error
    expect(() => imxClientConfig('invalid')).toThrowError('Invalid environment: invalid');
  });
});

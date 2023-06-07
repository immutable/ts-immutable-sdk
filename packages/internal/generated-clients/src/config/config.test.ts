/* eslint-disable @typescript-eslint/naming-convention */
import { imxConfig, ImxApiConfiguration } from './config';
import { Configuration } from '../imx';

const defaultHeaders = { 'x-sdk-version': 'ts-immutable-sdk-__SDK_VERSION__' };

describe('createConfig', () => {
  it('should throw if basePath is whitespace', () => {
    expect(() => imxConfig.createConfig({
      basePath: ' ',
    })).toThrowError('basePath can not be empty');
  });

  it('should throw if basePath is empty', () => {
    expect(() => imxConfig.createConfig({
      basePath: '',
    })).toThrowError('basePath can not be empty');
  });

  it('should return config', () => {
    const basePath = 'https://api.sandbox.x.immutable.com';
    const customHeaders = {
      'x-custom-headers': 'x values',
      'x-sdk-version': 'this should get overwritten',
    };
    const expected: ImxApiConfiguration = new Configuration({
      basePath,
      baseOptions: {
        headers: { 'x-custom-headers': 'x values', ...defaultHeaders },
      },
    });

    const actual = imxConfig.createConfig({
      basePath,
      headers: customHeaders,
    });
    expect(actual).toEqual(expected);
  });
});

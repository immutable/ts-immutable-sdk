/* eslint-disable @typescript-eslint/naming-convention */
import { createConfig, ImmutableAPIConfiguration } from './config';
import { Configuration } from '../imx';

const defaultHeaders = { 'x-sdk-version': 'ts-immutable-sdk-__SDK_VERSION__' };

describe('createConfig', () => {
  it('should throw if basePath is whitespace', () => {
    expect(() => createConfig({
      basePath: ' ',
    })).toThrowError('basePath can not be empty');
  });

  it('should throw if basePath is empty', () => {
    expect(() => createConfig({
      basePath: '',
    })).toThrowError('basePath can not be empty');
  });

  it('should return config', () => {
    const basePath = 'https://api.sandbox.x.immutable.com';
    const customHeaders = {
      'x-custom-headers': 'x values',
      'x-sdk-version': 'this should not get overwritten',
    };
    const expected: ImmutableAPIConfiguration = new Configuration({
      basePath,
      baseOptions: {
        headers: { ...defaultHeaders, ...customHeaders },
      },
    });

    const actual = createConfig({
      basePath,
      headers: customHeaders,
    });
    expect(actual).toEqual(expected);
  });
});

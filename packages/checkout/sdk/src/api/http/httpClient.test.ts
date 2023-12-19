import { Environment } from '@imtbl/config';
import axios, { AxiosResponse } from 'axios';
import { HttpClient } from './httpClient';
import { CheckoutModuleConfiguration } from '../../types';
import { CheckoutError, CheckoutErrorType } from '../../errors';

jest.mock('axios', () => ({
  create: jest.fn(),
}));

describe('HttpClient', () => {
  let testCheckoutConfig: CheckoutModuleConfiguration;
  let mockedAxios: jest.Mocked<typeof axios>;
  let mockedAxiosInstance: jest.Mocked<typeof axios>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockedAxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn(),
        },
      },
      request: jest.fn(),
    } as unknown as jest.Mocked<typeof axios>;
    mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.create.mockReturnValue(mockedAxiosInstance);
    testCheckoutConfig = {
      baseConfig: { environment: Environment.PRODUCTION },
    } as CheckoutModuleConfiguration;
  });

  it('sets up axios instance with interceptors', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const httpClient = new HttpClient(testCheckoutConfig);
    expect(mockedAxios.create).toBeCalledTimes(1);
    expect(mockedAxiosInstance.interceptors.request.use).toBeCalledTimes(1);
  });

  it('throws an error for an invalid publishable key', async () => {
    const requestConfig = {
      url: 'https://checkout-api.dev.immutable.com',
      headers: {},
    };

    const testCheckoutConfigWithInvalidKey = {
      baseConfig: {
        environment: Environment.PRODUCTION,
        publishableKey: 'invalid_key',
      },
    } as CheckoutModuleConfiguration;
    const httpClient = new HttpClient(testCheckoutConfigWithInvalidKey);

    try {
      await httpClient.request(requestConfig);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Invalid Publishable key');
    }
  });

  ['get', 'post', 'put'].forEach((method) => {
    describe(method, () => {
      it(`[${method}] should throw error when non-200 status`, async () => {
        const mockResponse = {
          status: 500,
          statusText: 'error 500 message',
        } as AxiosResponse;
        mockedAxiosInstance.request.mockResolvedValueOnce(mockResponse);

        const httpClient = new HttpClient(testCheckoutConfig);
        await expect((httpClient as any)[method]('/'))
          .rejects
          .toThrowError(new Error('Error: 500 error 500 message'));
      });

      it(`[${method}] should throw error when error fetching`, async () => {
        mockedAxiosInstance.request.mockRejectedValue({
          message: 'error message',
        });

        const httpClient = new HttpClient(testCheckoutConfig);
        await expect(httpClient.get('/')).rejects.toThrow(
          new CheckoutError(
            'error message',
            CheckoutErrorType.API_ERROR,
          ),
        );
      });
    });
  });
});

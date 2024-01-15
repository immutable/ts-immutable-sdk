import { Environment } from '@imtbl/config';
import axios, { AxiosError } from 'axios';
import { HttpClient } from './httpClient';
import { CheckoutModuleConfiguration } from '../../types';

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

  it('uses publishable-key header from publishableKey in config', async () => {
    mockedAxiosInstance.request.mockResolvedValue({
      status: 200,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-immutable-publishable-key': 'pk_imapik-1234',
      },
    });
    const requestConfig = {
      url: 'https://checkout-api.dev.immutable.com',
      headers: {},
    };

    const testCheckoutConfigWithKey = {
      baseConfig: {
        environment: Environment.PRODUCTION,
        publishableKey: 'pk_imapik-1234',
      },
    } as CheckoutModuleConfiguration;
    const httpClient = new HttpClient(testCheckoutConfigWithKey);

    const response = await httpClient.request(requestConfig);
    expect(response.status).toEqual(200);
    expect(response.headers).toEqual({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'x-immutable-publishable-key': 'pk_imapik-1234',
    });
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
      it(`[${method}] should throw error when non-2XX status`, async () => {
        const mockError = {
          isAxiosError: true,
          status: 500,
          message: 'Internal Server Error',
        } as AxiosError;
        mockedAxiosInstance.request.mockRejectedValue(mockError);

        const httpClient = new HttpClient(testCheckoutConfig);
        try {
          await (httpClient as any)[method]('/');
        } catch (err: any) {
          expect(err.isAxiosError).toBeTruthy();
          expect(err.status).toBe(500);
          expect(err.message).toBe('Internal Server Error');
        }
      });

      it(`[${method}] should throw error when error fetching`, async () => {
        mockedAxiosInstance.request.mockRejectedValue({
          message: 'error message',
        });

        const httpClient = new HttpClient(testCheckoutConfig);
        try {
          await httpClient.get('/');
        } catch (error:any) {
          expect(error.message).toBe('error message');
        }
      });
    });
  });
});

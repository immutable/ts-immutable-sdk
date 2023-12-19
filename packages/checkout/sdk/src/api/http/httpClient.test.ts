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

  ['get', 'post', 'put'].forEach((method) => {
    describe(method, () => {
      it(`[${method}] should throw error when non-200 status`, async () => {
        const mockResponse = {
          status: 500,
          statusText: 'error message',
        } as AxiosResponse;
        mockedAxiosInstance.request.mockResolvedValueOnce(mockResponse);

        const httpClient = new HttpClient(testCheckoutConfig);
        await expect((httpClient as any)[method]('/'))
          .rejects
          .toThrowError(new Error('Error fetching from api: 500 error message'));
      });

      it(`[${method}] should throw error when error fetching`, async () => {
        mockedAxiosInstance.request.mockRejectedValue({
          message: 'error message',
        });

        const httpClient = new HttpClient(testCheckoutConfig);
        await expect(httpClient.get('/')).rejects.toThrow(
          new CheckoutError(
            'Error fetching from api: error message',
            CheckoutErrorType.API_ERROR,
          ),
        );
      });
    });
  });
});

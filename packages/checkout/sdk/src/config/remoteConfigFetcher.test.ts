import axios from 'axios';
import { Environment } from '@imtbl/config';
import { CHECKOUT_API_BASE_URL } from '../types';
import { RemoteConfigFetcher } from './remoteConfigFetcher';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RemoteConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  Object.keys(Environment).forEach((env) => {
    it(`should fetch configs and cache them [${env}]`, async () => {
      const mockResponse = {
        status: 200,
        data: {
          dex: {
            overrides: {
              rpcURL: 'https://test.com',
            },
          },
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const fetcher = new RemoteConfigFetcher({
        environment: env as Environment,
      });
      await fetcher.get();
      await fetcher.get();

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${CHECKOUT_API_BASE_URL[env as Environment]}/v1/config`,
      );
    });
  });
});

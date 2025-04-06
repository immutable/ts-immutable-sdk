import { AxiosResponse } from 'axios';
import { ChainId } from '../types';
import { RemoteConfigFetcher } from './remoteConfigFetcher';
import { HttpClient } from '../api/http';

jest.mock('../api/http');

describe('RemoteConfig', () => {
  const version = 'v1';
  let mockedHttpClient: jest.Mocked<HttpClient>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  });

  describe('config', () => {
    it('should fetch configs and cache them', async () => {
      const mockResponse = {
        status: 200,
        data: {
          connect: {
            walletConnect: false,
          },
          dex: {
            overrides: {
              rpcURL: 'https://test.com',
            },
          },
          allowedNetworks: [ChainId.SEPOLIA],
        },
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

      const fetcher = new RemoteConfigFetcher(mockedHttpClient, {
        remoteConfigEndpoint: 'configUrl',
      });

      expect(await fetcher.getConfig()).toEqual({
        connect: {
          walletConnect: false,
        },
        dex: {
          overrides: {
            rpcURL: 'https://test.com',
          },
        },
        allowedNetworks: [ChainId.SEPOLIA],
      });

      expect(mockedHttpClient.get).toHaveBeenCalledTimes(1);
      expect(mockedHttpClient.get).toHaveBeenNthCalledWith(
        1,
        `configUrl/${version}/config`,
      );
    });

    it('should fetch config for key', async () => {
      const mockResponse = {
        status: 200,
        data: {
          connect: {
            walletConnect: false,
          },
          dex: {
            overrides: {
              rpcURL: 'https://test.com',
            },
          },
          allowedNetworks: [ChainId.SEPOLIA],
        },
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

      const fetcher = new RemoteConfigFetcher(mockedHttpClient, {
        remoteConfigEndpoint: 'abc',
      });

      expect(await fetcher.getConfig('allowedNetworks')).toEqual([ChainId.SEPOLIA]);
    });

    it('should return undefined if missing config', async () => {
      const mockResponse = {
        status: 200,
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

      const fetcher = new RemoteConfigFetcher(mockedHttpClient, {
        remoteConfigEndpoint: 'abc',
      });

      expect(await fetcher.getConfig()).toBeUndefined();
    });

    it('should throw error when configuration is invalid JSON', async () => {
      const mockInvalidJSONResponse = {
        status: 200,
        data: 'invalid json',
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValue(mockInvalidJSONResponse);

      const fetcher = new RemoteConfigFetcher(mockedHttpClient, {
        remoteConfigEndpoint: 'abc',
      });

      await expect(fetcher.getConfig()).rejects.toThrowError(
        new Error('Invalid configuration'),
      );
    });
  });
});

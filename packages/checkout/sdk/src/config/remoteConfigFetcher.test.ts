import { Environment } from '@imtbl/config';
import { AxiosResponse } from 'axios';
import { ChainId } from '../types';
import { RemoteConfigFetcher } from './remoteConfigFetcher';
import {
  CHECKOUT_CDN_BASE_URL,
  ENV_DEVELOPMENT,
} from '../env';
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

  [Environment.PRODUCTION, Environment.SANDBOX, ENV_DEVELOPMENT].forEach((env) => {
    describe('config', () => {
      it(`should fetch configs and cache them [${env}]`, async () => {
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
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
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
          `${CHECKOUT_CDN_BASE_URL[env]}/${version}/config`,
        );
      });

      it(`should fetch config for key [${env}]`, async () => {
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
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        expect(await fetcher.getConfig('allowedNetworks')).toEqual([ChainId.SEPOLIA]);
      });

      it(`should return undefined if missing config [${env}]`, async () => {
        const mockResponse = {
          status: 200,
        } as AxiosResponse;
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

        const fetcher = new RemoteConfigFetcher(mockedHttpClient, {
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
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
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        await expect(fetcher.getConfig()).rejects.toThrowError(
          new Error('Invalid configuration'),
        );
      });
    });

    describe('tokens', () => {
      it(`should fetch tokens and cache them [${env}]`, async () => {
        const mockResponse = {
          status: 200,
          data: {
            connect: {
              walletConnect: false,
            },
            [ChainId.IMTBL_ZKEVM_DEVNET]: {
              allowed: [
                {
                  address: '0xd686c80dc76766fa16eb95a4ad63d17937c7723c',
                  decimals: 18,
                  name: 'token-aa-testnet',
                  symbol: 'AA',
                },
              ],
            },
            [ChainId.SEPOLIA]: {
              metadata: [
                {
                  address: '0xd686c80dc76766fa16eb95a4ad63d17937c7723c',
                  decimals: 18,
                  name: 'token-aa-testnet',
                  symbol: 'AA',
                },
              ],
            },
          },
        } as AxiosResponse;
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

        const fetcher = new RemoteConfigFetcher(mockedHttpClient, {
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });
        await fetcher.getTokensConfig(ChainId.SEPOLIA);
        await fetcher.getTokensConfig(ChainId.IMTBL_ZKEVM_DEVNET);

        expect(mockedHttpClient.get).toHaveBeenCalledTimes(1);
        expect(mockedHttpClient.get).toHaveBeenNthCalledWith(
          1,
          `${CHECKOUT_CDN_BASE_URL[env as Environment]}/${version}/config/tokens`,
        );
      });

      it(`should return empty array if config missing [${env}]`, async () => {
        const mockResponse = {
          status: 200,
        } as AxiosResponse;
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

        const fetcher = new RemoteConfigFetcher(mockedHttpClient, {
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        expect(await fetcher.getTokensConfig(ChainId.SEPOLIA)).toEqual({});
      });
    });
  });
});

import axios from 'axios';
import { Environment } from '@imtbl/config';
import { CHECKOUT_API_BASE_URL, ChainId, ENV_DEVELOPMENT } from '../types';
import { RemoteConfigFetcher } from './remoteConfigFetcher';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RemoteConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  [Environment.PRODUCTION, Environment.SANDBOX, ENV_DEVELOPMENT].forEach((env) => {
    describe('config', () => {
      it(`should fetch configs and cache them [${env}]`, async () => {
        const mockResponse = {
          status: 200,
          data: {
            dex: {
              overrides: {
                rpcURL: 'https://test.com',
              },
            },
            allowedNetworks: [ChainId.SEPOLIA],
          },
        };
        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const fetcher = new RemoteConfigFetcher({
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        expect(await fetcher.getConfig()).toEqual({
          dex: {
            overrides: {
              rpcURL: 'https://test.com',
            },
          },
          allowedNetworks: [ChainId.SEPOLIA],
        });
        expect(await fetcher.getConfig()).toEqual({
          dex: {
            overrides: {
              rpcURL: 'https://test.com',
            },
          },
          allowedNetworks: [ChainId.SEPOLIA],
        });

        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).toHaveBeenNthCalledWith(
          1,
          `${CHECKOUT_API_BASE_URL[env]}/v1/config`,
        );
      });

      it(`should fetch config for key [${env}]`, async () => {
        const mockResponse = {
          status: 200,
          data: {
            dex: {
              overrides: {
                rpcURL: 'https://test.com',
              },
            },
            allowedNetworks: [ChainId.SEPOLIA],
          },
        };
        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const fetcher = new RemoteConfigFetcher({
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        expect(await fetcher.getConfig('allowedNetworks')).toEqual([ChainId.SEPOLIA]);
      });

      it(`should return undefined if missing config [${env}]`, async () => {
        const mockResponse = {
          status: 200,
        };
        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const fetcher = new RemoteConfigFetcher({
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        expect(await fetcher.getConfig()).toBeUndefined();
      });

      it(`should throw error when non-200 status [${env}]`, async () => {
        const mockResponse = {
          status: 500,
          statusText: 'error message',
        };
        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const fetcher = new RemoteConfigFetcher({
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        await expect(fetcher.getConfig()).rejects.toThrowError(new Error('Error fetching from api: 500 error message'));
      });

      it(`should throw error when error fetching [${env}]`, async () => {
        mockedAxios.get.mockRejectedValue({
          message: 'error message',
        });

        const fetcher = new RemoteConfigFetcher({
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        await expect(fetcher.getConfig()).rejects.toThrowError(new Error('Error fetching from api: error message'));
      });
    });

    describe('tokens', () => {
      it(`should fetch tokens and cache them [${env}]`, async () => {
        const mockResponse = {
          status: 200,
          data: {
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
        };
        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const fetcher = new RemoteConfigFetcher({
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });
        await fetcher.getTokens(ChainId.SEPOLIA);
        await fetcher.getTokens(ChainId.IMTBL_ZKEVM_DEVNET);

        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).toHaveBeenNthCalledWith(
          1,
          `${CHECKOUT_API_BASE_URL[env as Environment]}/v1/config/tokens`,
        );
      });

      it(`should return empty array if config missing [${env}]`, async () => {
        const mockResponse = {
          status: 200,
        };
        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const fetcher = new RemoteConfigFetcher({
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        expect(await fetcher.getTokens(ChainId.SEPOLIA)).toEqual([]);
      });

      it(`should throw error when non-200 status [${env}]`, async () => {
        const mockResponse = {
          status: 500,
          statusText: 'error message',
        };
        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const fetcher = new RemoteConfigFetcher({
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        await expect(fetcher.getTokens(ChainId.SEPOLIA))
          .rejects
          .toThrow(new Error('Error fetching from api: 500 error message'));
      });

      it(`should throw error when error fetching [${env}]`, async () => {
        mockedAxios.get.mockRejectedValue({
          message: 'error message',
        });

        const fetcher = new RemoteConfigFetcher({
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        await expect(fetcher.getTokens(ChainId.SEPOLIA))
          .rejects
          .toThrow(new Error('Error fetching from api: error message'));
      });
    });
  });
});

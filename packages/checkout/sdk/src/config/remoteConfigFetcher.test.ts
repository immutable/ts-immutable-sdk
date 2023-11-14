import axios from 'axios';
import { Environment } from '@imtbl/config';
import { ChainId } from '../types';
import { RemoteConfigFetcher } from './remoteConfigFetcher';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { CHECKOUT_API_BASE_URL, ENV_DEVELOPMENT } from '../env';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RemoteConfig', () => {
  const version:string = 'v2';

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
          `${CHECKOUT_API_BASE_URL[env]}/${version}/config`,
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

        await expect(fetcher.getConfig()).rejects.toThrow(
          new CheckoutError(
            'Error fetching from api: error message',
            CheckoutErrorType.API_ERROR,
          ),
        );
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
        await fetcher.getTokensConfig(ChainId.SEPOLIA);
        await fetcher.getTokensConfig(ChainId.IMTBL_ZKEVM_DEVNET);

        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).toHaveBeenNthCalledWith(
          1,
          `${CHECKOUT_API_BASE_URL[env as Environment]}/${version}/config/tokens`,
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

        expect(await fetcher.getTokensConfig(ChainId.SEPOLIA)).toEqual({});
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

        await expect(fetcher.getTokensConfig(ChainId.SEPOLIA))
          .rejects
          .toThrow(
            new CheckoutError(
              'Error fetching from api: 500 error message',
              CheckoutErrorType.API_ERROR,
            ),
          );
      });

      it(`should throw error when error fetching [${env}]`, async () => {
        mockedAxios.get.mockRejectedValue({
          message: 'error message',
        });

        const fetcher = new RemoteConfigFetcher({
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        await expect(fetcher.getTokensConfig(ChainId.SEPOLIA))
          .rejects
          .toThrow(
            new CheckoutError(
              'Error fetching from api: error message',
              CheckoutErrorType.API_ERROR,
            ),
          );
      });
    });
  });
});

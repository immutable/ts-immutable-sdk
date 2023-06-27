import axios from 'axios';
import { Environment } from '@imtbl/config';
import { ChainId, CHECKOUT_API_BASE_URL } from '../types';
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
      await fetcher.getConfig();
      await fetcher.getConfig();

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${CHECKOUT_API_BASE_URL[env as Environment]}/v1/config`,
      );
    });
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
        environment: env as Environment,
      });
      await fetcher.getTokens(ChainId.SEPOLIA);
      await fetcher.getTokens(ChainId.IMTBL_ZKEVM_DEVNET);

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${CHECKOUT_API_BASE_URL[env as Environment]}/v1/config/tokens`,
      );
    });
  });
});

import { Environment } from '@imtbl/config';
import { AxiosResponse } from 'axios';
import { ChainId } from '../types';
import { RemoteConfigFetcher } from './remoteConfigFetcher';
import {
  ENV_DEVELOPMENT,
} from '../env';
import { HttpClient } from '../api/http';
import { TokensFetcher } from './tokensFetcher';

jest.mock('../api/http');

describe('TokensFetcher', () => {
  let mockedHttpClient: jest.Mocked<HttpClient>;
  let mockedConfigClient: jest.Mocked<RemoteConfigFetcher>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
    mockedConfigClient = new RemoteConfigFetcher(mockedHttpClient, {
      isDevelopment: true,
      isProduction: false,
    }) as jest.Mocked<RemoteConfigFetcher>;
  });

  [Environment.PRODUCTION, Environment.SANDBOX, ENV_DEVELOPMENT].forEach((env) => {
    describe('tokens', () => {
      it(`should return empty array if config missing [${env}]`, async () => {
        const mockResponse = {
          status: 200,
        } as AxiosResponse;
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

        const fetcher = new TokensFetcher(mockedHttpClient, mockedConfigClient, {
          isDevelopment: env === ENV_DEVELOPMENT,
          isProduction: env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
        });

        expect(await fetcher.getTokensConfig(ChainId.SEPOLIA)).toEqual([]);
      });
    });
  });
});

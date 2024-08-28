import { Environment } from '@imtbl/config';
import { AxiosResponse } from 'axios';
import { ChainId, RemoteConfiguration } from '../types';
import { RemoteConfigFetcher } from './remoteConfigFetcher';
import { ENV_DEVELOPMENT } from '../env';
import { HttpClient } from '../api/http';
import { TokensFetcher } from './tokensFetcher';

jest.mock('../api/http');
jest.mock('./remoteConfigFetcher');

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

    mockedConfigClient.getConfig.mockResolvedValue({
      [ChainId.IMTBL_ZKEVM_TESTNET]: 'native',
      [ChainId.SEPOLIA]: '0xe2629e08f4125d14e446660028bD98ee60EE69F2',
    } as unknown as RemoteConfiguration);
  });

  [Environment.PRODUCTION, Environment.SANDBOX, ENV_DEVELOPMENT].forEach(
    (env) => {
      describe('getTokensConfig', () => {
        it(`should fetch tokens and cache them [${env}]`, async () => {
          const mockTokensResponse = {
            status: 200,
            data: {
              result: [
                {
                  chain: {
                    id: 'eip155:13473',
                    name: 'imtbl-zkevm-testnet',
                  },
                  contract_address:
                    '0xb8ee289c64c1a0dc0311364721ada8c3180d838c',
                  decimals: 18,
                  image_url: 'https://example.com/gog.svg',
                  is_canonical: true,
                  name: 'Guild of Guardians',
                  root_chain_id: 'eip155:11155111',
                  root_contract_address:
                    '0xfe9df9ebe5fbd94b00247613b6cf7629891954e2',
                  symbol: 'GOG',
                  verification_status: 'verified',
                },
                {
                  chain: {
                    id: 'eip155:13473',
                    name: 'imtbl-zkevm-testnet',
                  },
                  contract_address:
                    '0xe9E96d1aad82562b7588F03f49aD34186f996478',
                  decimals: 18,
                  image_url: 'https://example.com/eth.svg',
                  is_canonical: true,
                  name: 'Ethereum',
                  root_chain_id: 'eip155:11155111',
                  root_contract_address:
                    '0x0000000000000000000000000000000000000eee',
                  symbol: 'ETH',
                  verification_status: 'verified',
                },
                {
                  chain: {
                    id: 'eip155:13473',
                    name: 'imtbl-zkevm-testnet',
                  },
                  contract_address:
                    '0x3b2d8a1931736fc321c24864bceee981b11c3c50',
                  decimals: 6,
                  image_url: null,
                  is_canonical: true,
                  name: 'USDZ',
                  root_chain_id: null,
                  root_contract_address: null,
                  symbol: 'USDZ',
                  verification_status: 'verified',
                },
                {
                  chain: {
                    id: 'eip155:13473',
                  },
                  name: 'Invalid token',
                  contract_address: '0xinvalid',
                  symbol: null,
                  decimals: null,
                },
              ],
            },
          } as AxiosResponse;
          mockedHttpClient.get.mockResolvedValueOnce(mockTokensResponse);

          const fetcher = new TokensFetcher(
            mockedHttpClient,
            mockedConfigClient,
            {
              isDevelopment: env === ENV_DEVELOPMENT,
              isProduction:
                env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
            },
          );

          const chainsTokenConfig = await fetcher.getChainTokensConfig();
          // ChainsTokenConfig has the correct keys
          expect(chainsTokenConfig).toHaveProperty(
            ChainId.IMTBL_ZKEVM_TESTNET.toString(),
          );
          expect(chainsTokenConfig).toHaveProperty(ChainId.SEPOLIA.toString());
          expect(Object.keys(chainsTokenConfig)).toHaveLength(2);

          const tokensZkEVM = await fetcher.getTokensConfig(
            ChainId.IMTBL_ZKEVM_TESTNET,
          );
          const tokensSepolia = await fetcher.getTokensConfig(ChainId.SEPOLIA);

          // Number of tokens per chain is correct
          expect(tokensZkEVM).toHaveLength(4);
          expect(tokensSepolia).toHaveLength(3);

          // Tokens are correctly populated
          expect(tokensZkEVM.find((token) => token.symbol === 'GOG')).toEqual({
            address: '0xb8ee289c64c1a0dc0311364721ada8c3180d838c',
            decimals: 18,
            icon: 'https://example.com/gog.svg',
            name: 'Guild of Guardians',
            symbol: 'GOG',
          });

          // Tokens with invalid info are ignored
          expect(
            tokensZkEVM.find((token) => token.address === '0xinvalid'),
          ).toBeUndefined();
          expect(
            tokensSepolia.find((token) => token.address === '0xinvalid'),
          ).toBeUndefined();

          // IMX token is populated
          expect(
            tokensZkEVM.find((token) => token.symbol === 'IMX'),
          ).toHaveProperty('address', 'native');
          expect(
            tokensSepolia.find((token) => token.symbol === 'IMX'),
          ).toHaveProperty(
            'address',
            '0xe2629e08f4125d14e446660028bD98ee60EE69F2',
          );

          // ETH root contract is mapped to native in L1
          expect(
            tokensSepolia.find((token) => token.symbol === 'ETH'),
          ).toHaveProperty('address', 'native');
          expect(
            tokensZkEVM.find((token) => token.symbol === 'ETH'),
          ).toHaveProperty(
            'address',
            '0xe9e96d1aad82562b7588f03f49ad34186f996478',
          );

          // HTTP request is cached after first occurrence
          expect(mockedHttpClient.get).toHaveBeenCalledTimes(1);
        });

        it(`should return empty array if config missing [${env}]`, async () => {
          mockedConfigClient.getConfig.mockResolvedValue(
            {} as unknown as RemoteConfiguration,
          );

          const mockResponse = {
            status: 200,
            data: {
              result: [],
            },
          } as AxiosResponse;
          mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

          const fetcher = new TokensFetcher(
            mockedHttpClient,
            mockedConfigClient,
            {
              isDevelopment: env === ENV_DEVELOPMENT,
              isProduction:
                env !== ENV_DEVELOPMENT && env === Environment.PRODUCTION,
            },
          );

          expect(await fetcher.getChainTokensConfig()).toEqual({});
          expect(await fetcher.getTokensConfig(ChainId.SEPOLIA)).toEqual([]);
        });
      });
    },
  );
});

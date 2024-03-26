/* eslint @typescript-eslint/naming-convention: off */
import { AxiosResponse, HttpStatusCode } from 'axios';
import { Blockscout } from './blockscout';
import {
  BlockscoutError,
  BlockscoutTokenType,
} from './blockscoutType';
import { BLOCKSCOUT_CHAIN_URL_MAP, NATIVE } from '../../env';
import { ChainId } from '../../types';
import { HttpClient } from '../http';

jest.mock('../http', () => ({
  HttpClient: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
  })),
}));

describe('Blockscout', () => {
  let mockedHttpClient: jest.Mocked<HttpClient>;
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  });

  describe('isChainSupported', () => {
    it('supported', () => {
      Object.keys(BLOCKSCOUT_CHAIN_URL_MAP).forEach((chain) => {
        expect(Blockscout.isChainSupported(chain as unknown as ChainId)).toBe(true);
      });
    });
    it('not supported', () => {
      expect(Blockscout.isChainSupported('aaa' as unknown as ChainId)).toBe(false);
    });
  });

  describe('getTokensByWalletAddress', () => {
    it('success', async () => {
      const mockResponse = {
        status: 200,
        data:
          {
            items: [
              {
                token: {
                  address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
                  circulating_market_cap: '639486814.4877648',
                  decimals: '18',
                  exchange_rate: '0.568914',
                  holders: '71451',
                  icon_url: 'https://assets.coingecko.com',
                  name: 'Immutable X',
                  symbol: 'IMX',
                  total_supply: '2000000000000000000000000000',
                  type: 'ERC-20',
                },
                token_id: null,
                token_instance: null,
                value: '3000000000000000000',
              },
              {
                token: {
                  address: '',
                  circulating_market_cap: '639486814.4877648',
                  decimals: '18',
                  exchange_rate: '0.568914',
                  holders: '71451',
                  icon_url: 'https://assets.coingecko.com',
                  name: 'Immutable X',
                  symbol: 'IMX',
                  total_supply: '8000000000000000000000000000',
                  type: 'ERC-20',
                },
                token_id: null,
                token_instance: null,
                value: '6000000000000000000',
              },
            ],
            next_page_params: null,
          },
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

      const token = BlockscoutTokenType.ERC20;
      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);
      const resp = await client.getTokensByWalletAddress(
        {
          walletAddress: '0x1234567890',
          tokenType: token,
        },
      );

      // should not contain native token data
      expect(resp.items.length).toEqual(1);
      expect(resp.items[0].value).toEqual('3000000000000000000');
      expect(resp.items[0].token.address).toEqual('0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF');

      expect(mockedHttpClient.get).toHaveBeenNthCalledWith(
        1,
        `${client.url}/api/v2/addresses/0x1234567890/tokens?type=${token}`,
      );
    });

    it('success cached', async () => {
      const mockResponse = {
        status: 200,
        data:
          {
            items: [],
            next_page_params: null,
          },
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValue(mockResponse);

      const token = BlockscoutTokenType.ERC20;
      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);

      const precache = await client.getTokensByWalletAddress({ walletAddress: '0x1234567890', tokenType: token });
      const cached = await client.getTokensByWalletAddress({ walletAddress: '0x1234567890', tokenType: token });

      expect(cached).toEqual(precache);

      expect(mockedHttpClient.get).toHaveBeenNthCalledWith(
        1,
        `${client.url}/api/v2/addresses/0x1234567890/tokens?type=${token}`,
      );
    });

    it('success zero TTL', async () => {
      const mockResponse = {
        status: 200,
        data:
          {
            items: [],
            next_page_params: null,
          },
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValue(mockResponse);

      const token = BlockscoutTokenType.ERC20;
      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET, 0);

      await client.getTokensByWalletAddress({ walletAddress: '0x1234567890', tokenType: token });
      await client.getTokensByWalletAddress({ walletAddress: '0x1234567890', tokenType: token });

      expect(mockedHttpClient.get).toHaveBeenNthCalledWith(
        2,
        `${client.url}/api/v2/addresses/0x1234567890/tokens?type=${token}`,
      );
    });

    it('success with pagination', async () => {
      const mockResponse = {
        status: 200,
        data: {},
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

      const token = BlockscoutTokenType.ERC20;
      const nextPage = {
        fiat_value: '217517',
        id: 12,
        items_count: 50,
        value: '1234',
      };
      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);
      await client.getTokensByWalletAddress({ walletAddress: '0x1234567890', tokenType: token, nextPage });

      expect(mockedHttpClient.get).toHaveBeenNthCalledWith(
        1,
        `${client.url}/api/v2/addresses/0x1234567890/tokens?type=${token}`
        + '&fiat_value=217517&id=12&items_count=50&value=1234',
      );
    });

    it('success with no pagination', async () => {
      const mockResponse = {
        status: 200,
        data: {},
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

      const token = BlockscoutTokenType.ERC20;
      const nextPage = null;
      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);
      await client.getTokensByWalletAddress({ walletAddress: '0x1234567890', tokenType: token, nextPage });

      expect(mockedHttpClient.get).toHaveBeenNthCalledWith(
        1,
        `${client.url}/api/v2/addresses/0x1234567890/tokens?type=${token}`,
      );
    });

    it('fails 400', async () => {
      const mockResponse = {
        status: HttpStatusCode.BadRequest,
        statusText: 'error',
        data: {},
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

      const token = BlockscoutTokenType.ERC20;
      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);
      try {
        await client.getTokensByWalletAddress({ walletAddress: '0x1234567890', tokenType: token });
      } catch (error: any) {
        expect(Blockscout.isBlockscoutError(error)).toBe(true);
        expect((error as BlockscoutError).code).toEqual(HttpStatusCode.BadRequest);
        expect((error as BlockscoutError).message).toEqual('error');
      }
    });

    it('fails 500', async () => {
      const mockResponse = {
        status: HttpStatusCode.InternalServerError,
        statusText: 'error',
        data: {},
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

      const token = BlockscoutTokenType.ERC20;
      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);
      try {
        await client.getTokensByWalletAddress({ walletAddress: '0x1234567890', tokenType: token });
      } catch (error: any) {
        expect(Blockscout.isBlockscoutError(error)).toBe(true);
        expect((error as BlockscoutError).code).toEqual(HttpStatusCode.InternalServerError);
        expect((error as BlockscoutError).message).toEqual('error');
      }
    });

    it('throws', async () => {
      mockedHttpClient.get.mockRejectedValueOnce('error');

      const token = BlockscoutTokenType.ERC20;
      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);
      try {
        await client.getTokensByWalletAddress({ walletAddress: '0x1234567890', tokenType: token });
      } catch (error: any) {
        expect(Blockscout.isBlockscoutError(error)).toBe(true);
        expect((error as BlockscoutError).code).toEqual(HttpStatusCode.InternalServerError);
        expect((error as BlockscoutError).message).toEqual('InternalServerError');
      }
    });
  });

  describe('getNativeTokenByWalletAddress', () => {
    it('success', async () => {
      const mockResponse = {
        status: 200,
        data: {
          block_number_balance_updated_at: 1062475,
          coin_balance: '55290000000000000000',
          exchange_rate: '0.569',
          hash: '0x933d4CE1B6334d2Ede312765Dc31e3105CA28e31',
        },
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);
      const resp = await client.getNativeTokenByWalletAddress(
        {
          walletAddress: '0x1234567890',
        },
      );

      expect(resp.value).toEqual('55290000000000000000');
      expect(resp.token.address).toEqual(NATIVE);

      expect(mockedHttpClient.get).toHaveBeenNthCalledWith(
        1,
        `${client.url}/api/v2/addresses/0x1234567890`,
      );
    });

    it('success cached', async () => {
      const mockResponse = {
        status: 200,
        data:
          {
            coin_balance: null,
          },
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValue(mockResponse);

      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);

      const precache = await client.getNativeTokenByWalletAddress({ walletAddress: '0x1234567890' });
      const cached = await client.getNativeTokenByWalletAddress({ walletAddress: '0x1234567890' });

      expect(cached).toEqual(precache);

      expect(mockedHttpClient.get).toHaveBeenNthCalledWith(
        1,
        `${client.url}/api/v2/addresses/0x1234567890`,
      );
    });

    it('success zero TTL', async () => {
      const mockResponse = {
        status: 200,
        data:
          {
            coin_balance: null,
          },
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValue(mockResponse);

      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET, 0);

      await client.getNativeTokenByWalletAddress({ walletAddress: '0x1234567890' });
      await client.getNativeTokenByWalletAddress({ walletAddress: '0x1234567890' });

      expect(mockedHttpClient.get).toHaveBeenNthCalledWith(
        2,
        `${client.url}/api/v2/addresses/0x1234567890`,
      );
    });

    it('fails 400', async () => {
      const mockResponse = {
        status: HttpStatusCode.BadRequest,
        statusText: 'error',
        data: {},
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);
      try {
        await client.getNativeTokenByWalletAddress({ walletAddress: '0x1234567890' });
      } catch (error: any) {
        expect(Blockscout.isBlockscoutError(error)).toBe(true);
        expect((error as BlockscoutError).code).toEqual(HttpStatusCode.BadRequest);
        expect((error as BlockscoutError).message).toEqual('error');
      }
    });

    it('fails 500', async () => {
      const mockResponse = {
        status: HttpStatusCode.InternalServerError,
        statusText: 'error',
        data: {},
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse);

      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);
      try {
        await client.getNativeTokenByWalletAddress({ walletAddress: '0x1234567890' });
      } catch (error: any) {
        expect(Blockscout.isBlockscoutError(error)).toBe(true);
        expect((error as BlockscoutError).code).toEqual(HttpStatusCode.InternalServerError);
        expect((error as BlockscoutError).message).toEqual('error');
      }
    });

    it('throws', async () => {
      mockedHttpClient.get.mockRejectedValueOnce('error');

      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);
      try {
        await client.getNativeTokenByWalletAddress({ walletAddress: '0x1234567890' });
      } catch (error: any) {
        expect(Blockscout.isBlockscoutError(error)).toBe(true);
        expect((error as BlockscoutError).code).toEqual(HttpStatusCode.InternalServerError);
        expect((error as BlockscoutError).message).toEqual('InternalServerError');
      }
    });
  });
});

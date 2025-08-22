/* eslint @typescript-eslint/naming-convention: off */
import { AxiosResponse, HttpStatusCode } from 'axios';
import * as metrics from '@imtbl/metrics';
import { Blockscout } from './blockscout';
import {
  BlockscoutError,
  BlockscoutERC20Response,
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

jest.mock('@imtbl/metrics', () => ({
  trackError: jest.fn(),
}));

const mockERC20Response = {
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
  data:
    {
      items: [
        {
          token: {
            address_hash: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
            circulating_market_cap: '639486814.4877648',
            decimals: '18',
            exchange_rate: '0.568914',
            holders_count: '71451',
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
            address_hash: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e77aB',
            circulating_market_cap: '639486814.4877648',
            decimals: '18',
            exchange_rate: '0.568914',
            holders_count: '71451',
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
} as AxiosResponse<BlockscoutERC20Response>;

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
      mockedHttpClient.get.mockResolvedValueOnce(mockERC20Response);

      const token = BlockscoutTokenType.ERC20;
      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);
      const resp = await client.getTokensByWalletAddress(
        {
          walletAddress: '0x1234567890',
          tokenType: token,
        },
      );

      expect(resp.items.length).toEqual(2);
      expect(resp.items[0].value).toEqual('3000000000000000000');
      expect(resp.items[0].token.address).toEqual('0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF');

      expect(resp.items[1].value).toEqual('6000000000000000000');
      expect(resp.items[1].token.address).toEqual('0xF57e7e7C23978C3cAEC3C3548E3D615c346e77aB');

      expect(mockedHttpClient.get).toHaveBeenNthCalledWith(
        1,
        `${client.url}/api/v2/addresses/0x1234567890/tokens?type=${token}`,
      );
    });

    it('success cached', async () => {
      mockedHttpClient.get.mockResolvedValue(mockERC20Response);

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
      mockedHttpClient.get.mockResolvedValue(mockERC20Response);

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
      mockedHttpClient.get.mockResolvedValueOnce(mockERC20Response);

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
      mockedHttpClient.get.mockResolvedValueOnce(mockERC20Response);

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
      const mock400Response = {
        status: HttpStatusCode.BadRequest,
        statusText: 'error',
        data: {},
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mock400Response);

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
      const mock500Response = {
        status: HttpStatusCode.InternalServerError,
        statusText: 'error',
        data: {},
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mock500Response);

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

    it('skips validation for non-2xx responses', async () => {
      // Mock a 400 response with invalid data structure that would fail validation
      const mock400Response = {
        status: HttpStatusCode.BadRequest,
        statusText: 'Bad Request',
        data: { error: 'Invalid request' }, // This doesn't match BlockscoutERC20Response schema
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mock400Response);

      const token = BlockscoutTokenType.ERC20;
      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);

      // This should return the raw data without validation errors
      const result = await client.getTokensByWalletAddress({
        walletAddress: '0x1234567890',
        tokenType: token,
      });

      // Should return the raw error data without validation
      expect(result).toEqual({ error: 'Invalid request' });
    });

    it('calls trackError and returns data when 2xx response fails validation', async () => {
      // Mock a 200 response with invalid data structure that will fail validation
      const mockInvalidResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          items: [
            {
              token: {
                address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF', // incorrect field name
                circulating_market_cap: '639486814.4877648',
                decimals: '18',
                exchange_rate: '0.569',
                holders: '123456', // incorrect field name
                icon_url: 'https://example.com/icon.png',
                name: 'Test Token',
                symbol: 'TEST',
                total_supply: '1000000000000000000000000',
                type: 'ERC-20',
                extra_field: 'this is not in the schema',
                another_unexpected_field: { nested: 'object' },
              },
              token_id: null,
              token_instance: null,
              value: '1000000000000000000',
            },
          ],
          next_page_params: null,
        },
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockInvalidResponse);

      const token = BlockscoutTokenType.ERC20;
      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);

      const result = await client.getTokensByWalletAddress({
        walletAddress: '0x1234567890',
        tokenType: token,
      });

      // Should call trackError for validation failure
      expect(metrics.trackError).toHaveBeenCalledWith(
        'checkout',
        'blockscout_response_validation_failed',
        expect.any(Error),
      );

      // Should still return the raw response data without throwing
      expect(result).toEqual({ items: [], next_page_params: null });
    });

    it('handles valid response with extra properties', async () => {
      // Mock a 200 response with valid structure but extra unexpected property
      const mockResponseWithExtraProperty = {
        status: 200,
        statusText: 'OK',
        data: {
          items: [
            {
              token: {
                address_hash: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
                circulating_market_cap: '639486814.4877648',
                decimals: '18',
                exchange_rate: '0.569',
                holders_count: '123456',
                icon_url: 'https://example.com/icon.png',
                name: 'Test Token',
                symbol: 'TEST',
                total_supply: '1000000000000000000000000',
                type: 'ERC-20',
                extra_field: 'this is not in the schema',
                another_unexpected_field: { nested: 'object' },
              },
              token_id: null,
              token_instance: null,
              value: '1000000000000000000',
            },
          ],
          next_page_params: null,
        },
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponseWithExtraProperty);

      const token = BlockscoutTokenType.ERC20;
      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);

      const result = await client.getTokensByWalletAddress({
        walletAddress: '0x1234567890',
        tokenType: token,
      });

      // trackError should NOT be called - validation should pass with extra properties stripped
      expect(metrics.trackError).not.toHaveBeenCalled();

      // Should return processed data with extra properties removed
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('next_page_params');
      expect(result.items).toHaveLength(1);

      // Should contain normalized token data (address_hash -> address)
      expect(result.items[0].token).toHaveProperty('address', '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF');
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

    it('calls trackError and returns data when 2xx response fails validation', async () => {
      // Mock a 200 response with invalid data structure that will fail validation
      const mockInvalidResponse = {
        status: 200,
        statusText: 'OK',
        data: { balance: '55290000000000000000' }, // Wrong field name - should be 'coin_balance'
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockInvalidResponse);

      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);

      const result = await client.getNativeTokenByWalletAddress({
        walletAddress: '0x1234567890',
      });

      // Should call trackError for validation failure
      expect(metrics.trackError).toHaveBeenCalledWith(
        'checkout',
        'blockscout_response_validation_failed',
        expect.any(Error),
      );

      expect(result.value).toEqual(undefined);
    });

    it('handles valid response with extra properties', async () => {
      // Mock a 200 response with valid structure but extra unexpected properties
      const mockResponseWithExtraProperty = {
        status: 200,
        statusText: 'OK',
        data: {
          coin_balance: '55290000000000000000',
          hash: '0x933d4CE1B6334d2Ede312765Dc31e3105CA28e31', // Extra property
          extra_field: 'this should be ignored', // Extra property
        },
      } as AxiosResponse;
      mockedHttpClient.get.mockResolvedValueOnce(mockResponseWithExtraProperty);

      const client = new Blockscout(mockedHttpClient, ChainId.IMTBL_ZKEVM_TESTNET);

      const result = await client.getNativeTokenByWalletAddress({
        walletAddress: '0x1234567890',
      });

      // trackError should NOT be called - validation should pass with extra properties stripped
      expect(metrics.trackError).not.toHaveBeenCalled();

      // Verify the coin_balance was used correctly
      expect(result.value).toBe('55290000000000000000');
    });
  });
});

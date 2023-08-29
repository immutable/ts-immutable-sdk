/* eslint @typescript-eslint/naming-convention: off */
import axios, { HttpStatusCode } from 'axios';
import {
  BLOCKSCOUNT_CHAIN_URL_MAP,
  ChainId,
} from '../types';
import { Blockscout } from './blockscout';
import {
  BlockscoutError,
  BlockscoutTokenType,
} from './blockscoutType';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Blockscout', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isChainSupported', () => {
    it('supported', () => {
      Object.keys(BLOCKSCOUNT_CHAIN_URL_MAP).forEach((chain) => {
        expect(Blockscout.isChainSupported(chain as unknown as ChainId)).toBe(true);
      });
    });
    it('not supported', () => {
      expect(Blockscout.isChainSupported(ChainId.SEPOLIA)).toBe(false);
    });
  });

  describe('getAddressTokens', () => {
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
            ],
            next_page_params: null,
          },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const tokens = [BlockscoutTokenType.ERC20];
      const client = new Blockscout({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
      const resp = await client.getAddressTokens({ walletAddress: '0x1234567890', tokenType: tokens });

      expect(resp.items.length).toEqual(1);
      expect(resp.items[0].value).toEqual('3000000000000000000');
      expect(resp.items[0].token.address).toEqual('0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF');

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${client.url}/api/v2/addresses/0x1234567890/tokens?type=${tokens.join(',')}`,
      );
    });

    it('success with pagination', async () => {
      const mockResponse = {
        status: 200,
        data: {},
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const tokens = [BlockscoutTokenType.ERC20];
      const next = {
        fiat_value: '217517',
        id: 12,
        items_count: 50,
        value: '1234',
      };
      const client = new Blockscout({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
      await client.getAddressTokens({ walletAddress: '0x1234567890', tokenType: tokens, next });

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${client.url}/api/v2/addresses/0x1234567890/tokens?type=${tokens.join(',')}`
        + '&fiat_value=217517&id=12&items_count=50&value=1234',
      );
    });

    it('success with no pagination', async () => {
      const mockResponse = {
        status: 200,
        data: {},
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const tokens = [BlockscoutTokenType.ERC20];
      const next = null;
      const client = new Blockscout({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
      await client.getAddressTokens({ walletAddress: '0x1234567890', tokenType: tokens, next });

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${client.url}/api/v2/addresses/0x1234567890/tokens?type=${tokens.join(',')}`,
      );
    });

    it('fails 400', async () => {
      const mockResponse = {
        status: HttpStatusCode.BadRequest,
        statusText: 'error',
        data: {},
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const tokens = [BlockscoutTokenType.ERC20];
      const client = new Blockscout({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
      try {
        await client.getAddressTokens({ walletAddress: '0x1234567890', tokenType: tokens });
      } catch (error: any) {
        expect(Blockscout.isBlockscoutError(error)).toBe(true);
        expect((error as BlockscoutError).code).toEqual(HttpStatusCode.BadRequest);
        expect((error as BlockscoutError).message).toEqual('error');
      }
    });

    it('fails 400', async () => {
      const mockResponse = {
        status: HttpStatusCode.InternalServerError,
        statusText: 'error',
        data: {},
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const tokens = [BlockscoutTokenType.ERC20];
      const client = new Blockscout({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
      try {
        await client.getAddressTokens({ walletAddress: '0x1234567890', tokenType: tokens });
      } catch (error: any) {
        expect(Blockscout.isBlockscoutError(error)).toBe(true);
        expect((error as BlockscoutError).code).toEqual(HttpStatusCode.InternalServerError);
        expect((error as BlockscoutError).message).toEqual('error');
      }
    });

    it('fails 500', async () => {
      const mockResponse = {
        status: HttpStatusCode.InternalServerError,
        statusText: 'error',
        data: {},
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const tokens = [BlockscoutTokenType.ERC20];
      const client = new Blockscout({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
      try {
        await client.getAddressTokens({ walletAddress: '0x1234567890', tokenType: tokens });
      } catch (error: any) {
        expect(Blockscout.isBlockscoutError(error)).toBe(true);
        expect((error as BlockscoutError).code).toEqual(HttpStatusCode.InternalServerError);
        expect((error as BlockscoutError).message).toEqual('error');
      }
    });

    it('throws', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error());

      const tokens = [BlockscoutTokenType.ERC20];
      const client = new Blockscout({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
      try {
        await client.getAddressTokens({ walletAddress: '0x1234567890', tokenType: tokens });
      } catch (error: any) {
        expect(Blockscout.isBlockscoutError(error)).toBe(true);
        expect((error as BlockscoutError).code).toEqual(HttpStatusCode.InternalServerError);
        expect((error as BlockscoutError).message).toEqual('InternalServerError');
      }
    });
  });
});

import axios, {
  AxiosError,
  AxiosResponse,
  HttpStatusCode,
} from 'axios';
import { z } from 'zod';
import { trackError } from '@imtbl/metrics';
import { ChainId } from '../../types';
import {
  BlockscoutNativeResponse,
  BlockscoutNativeResponseSchema,
  BlockscoutERC20Response,
  BlockscoutERC20ResponseItem,
  BlockscoutERC20ResponseSchema,
  BlockscoutNativeTokenData,
  BlockscoutToken,
  BlockscoutTokenData,
  BlockscoutTokenPagination,
  BlockscoutTokens,
  BlockscoutTokenType,
} from './blockscoutType';
import { BLOCKSCOUT_CHAIN_URL_MAP } from '../../env';
import { HttpClient } from '../http';

type CacheData = {
  data: any,
  ttl: number
};

const CACHE_DATA_TTL = 5; // seconds

/**
 * Blockscout class provides a client abstraction for the Immutable 3rd party indexer.
 */
export class Blockscout {
  readonly url: string;

  readonly nativeToken: BlockscoutNativeTokenData;

  readonly ttl: number;

  readonly chainId: ChainId;

  private cacheMap: { [key: string]: CacheData };

  private httpClient: HttpClient;

  private setCache(key: string, data: any) {
    this.cacheMap[key] = { data, ttl: new Date().getTime() + this.ttl * 1000 };
  }

  private getCache(key: string): any {
    const d = this.cacheMap[key];
    if (!d || d.ttl <= new Date().getTime()) return null;
    return d.data;
  }

  /**
   * Blockscout constructor
   * @param httpClient Client used for http requests
   * @param chainId target chain
   * @param ttl cache TTL
   */
  constructor(
    httpClient: HttpClient,
    chainId: ChainId,
    ttl?: number,
  ) {
    this.httpClient = httpClient;
    this.chainId = chainId;
    this.url = BLOCKSCOUT_CHAIN_URL_MAP[this.chainId].url;

    const native = BLOCKSCOUT_CHAIN_URL_MAP[this.chainId].nativeToken;
    this.nativeToken = {
      address: native.address ?? '',
      decimals: native.decimals.toString(),
      name: native.name,
      symbol: native.symbol,
    };

    this.cacheMap = {};
    this.ttl = ttl !== undefined ? ttl : CACHE_DATA_TTL;
  }

  /**
   * Generic HTTP GET method with schema validation and caching
   * @param url The URL to fetch from
   * @param schema Zod schema to validate the response
   * @returns Promise with validated and typed response data
   */
  private async httpGet<T>(url: string, schema: z.ZodSchema<T>): Promise<T> {
    try {
      // Cache response data to prevent unnecessary requests
      const cached = this.getCache(url);
      if (cached) return Promise.resolve(cached);

      // success if 2XX response otherwise throw error
      const response: AxiosResponse = await this.httpClient.get(url);

      // Only validate response structure for successful responses (2xx)
      if (response.status >= 200 && response.status < 300) {
        try {
          const validatedData = schema.parse(response.data);
          this.setCache(url, validatedData);
          return Promise.resolve(validatedData);
        } catch (validationError: any) {
          console.log('validationError', validationError);
          trackError('checkout', 'blockscout_response_validation_failed', validationError);
          return Promise.resolve(response.data);
        }
      }

      // For non-2xx responses, return data without validation
      return Promise.resolve(response.data);
    } catch (err: any) {
      let code: number = HttpStatusCode.InternalServerError;
      let message = 'InternalServerError';
      if (axios.isAxiosError(err)) {
        code = (err as AxiosError).response?.status || code;
        message = (err as AxiosError).message;
      }
      return Promise.reject({ code, message });
    }
  }

  /**
   * isChainSupported verifies if the chain is supported by Blockscout
   * @param chainId
   */
  public static isChainSupported = (chainId: ChainId): boolean => Boolean(BLOCKSCOUT_CHAIN_URL_MAP[chainId]);

  /**
   * isBlockscoutError verifies if the error is a Blockscout client error
   * @param err error to evaluate
   */
  public static isBlockscoutError = (err: any): boolean => 'code' in err;

  /**
   * getTokensByWalletAddress fetches the list of tokens (by type) owned by the wallet address.
   * @param walletAddress wallet address
   * @param tokenType token type
   * @param nextPage parameters for the next page, to be provided alongside walletAddress and tokenType
   * @returns list of tokens given the wallet address and the token types
   */
  public async getTokensByWalletAddress(params: {
    walletAddress: string,
    tokenType: BlockscoutTokenType,
    nextPage?: BlockscoutTokenPagination | null
  }): Promise<BlockscoutTokens> {
    let url = `${this.url}/api/v2/addresses/${params.walletAddress}/tokens?type=${params.tokenType}`;
    if (params.nextPage) url += `&${new URLSearchParams(params.nextPage as Record<string, string>)}`;

    // Use the generic httpGet method with schema validation
    const response = await this.httpGet<BlockscoutERC20Response>(url, BlockscoutERC20ResponseSchema);

    // blockscout changed their API to return address_hash instead of address
    // map the address_hash to address field so that any further consumer is not affected by the change
    const normalizedItems: BlockscoutToken[] = response.items?.map(
      (item: BlockscoutERC20ResponseItem) => {
        const token: BlockscoutTokenData = {
          ...item.token,
          icon_url: item.token.icon_url ?? '',
          address: item.token.address_hash,
          holders: item.token.holders_count,
        };

        return {
          ...item,
          token,
        };
      },
    ) || [];

    // To get around an issue with native tokens being an ERC-20, there is the need
    // to remove IMX from `resp` and add it back in using getNativeTokenByWalletAddress.
    // This has affected some of the early wallets, and it might not be an issue in mainnet
    // however, let's enforce it.
    const data = {
      items: normalizedItems.filter(
        (token: BlockscoutToken) => token.token.address && token.token.address !== this.nativeToken.address,
      ),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      next_page_params: response.next_page_params,
    };

    return Promise.resolve(data);
  }

  /**
   * getNativeTokenByWalletAddress fetches the native token owned by the wallet address.
   * @param walletAddress wallet address
   * @returns list of tokens given the wallet address and the token types
   */
  public async getNativeTokenByWalletAddress(params: { walletAddress: string, }): Promise<BlockscoutToken> {
    const url = `${this.url}/api/v2/addresses/${params.walletAddress}`;

    // Use the generic httpGet method with schema validation
    const response = await this.httpGet<BlockscoutNativeResponse>(url, BlockscoutNativeResponseSchema);

    const data = {
      token: this.nativeToken,
      value: response.coin_balance,
    };

    return Promise.resolve(data);
  }
}

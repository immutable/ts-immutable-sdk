import axios, {
  AxiosResponse,
  HttpStatusCode,
} from 'axios';
import { BLOCKSCOUT_CHAIN_URL_MAP, ChainId } from '../types';
import {
  BlockscoutAddressTokenPagination,
  BlockscoutAddressTokens,
  BlockscoutTokenType,
} from './blockscoutType';

type CacheData = {
  data: any,
  ttl: number
};

const CACHE_DATA_TTL = 60; // seconds

/**
 * Blockscout class provides a client abstraction for the Immutable 3rd party indexer.
 */
export class Blockscout {
  readonly url: string;

  readonly ttl: number;

  readonly chainId: ChainId;

  private cacheMap: { [key: string]: CacheData };

  private static async makeHttpRequest(url: string): Promise<AxiosResponse> {
    return axios.get(url);
  }

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
   * @param chainId target chain
   * @param ttl cache TTL
   */
  constructor(params: {
    chainId: ChainId;
    ttl?: number
  }) {
    this.chainId = params.chainId;
    this.url = BLOCKSCOUT_CHAIN_URL_MAP[this.chainId];
    this.cacheMap = {};
    this.ttl = params.ttl !== undefined ? params.ttl : CACHE_DATA_TTL;
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
   * getAddressTokens fetches the list of tokens (by type) owned by the wallet address.
   * @param walletAddress wallet address
   * @param tokenType token types
   * @param nextPage parameters for the next page, to be provided along side walletAddress and tokenType
   * @returns list of tokens given the wallet address and the token types
   */
  public async getAddressTokens(params: {
    walletAddress: string,
    tokenType: BlockscoutTokenType[],
    nextPage?: BlockscoutAddressTokenPagination | null
  }): Promise<BlockscoutAddressTokens> {
    try {
      let url = `${this.url}/api/v2/addresses/${params.walletAddress}/tokens?type=${params.tokenType.join(',')}`;
      if (params.nextPage) url += `&${new URLSearchParams(params.nextPage as Record<string, string>)}`;

      // Cache response data to prevent unnecessary requests
      const cached = this.getCache(url) as AxiosResponse;
      if (cached && cached.status < 400) return Promise.resolve(cached.data);

      const response = await Blockscout.makeHttpRequest(url);
      if (response.status >= 400) {
        return Promise.reject({ code: response.status, message: response.statusText });
      }

      this.setCache(url, response);
      return Promise.resolve(response.data);
    } catch (err: any) {
      return Promise.reject({
        code: err.code ?? HttpStatusCode.InternalServerError,
        message: err.message || 'InternalServerError',
      });
    }
  }
}

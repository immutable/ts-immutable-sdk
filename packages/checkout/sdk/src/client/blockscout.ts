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

type CacheData = BlockscoutAddressTokens;

type Cache = {
  data: CacheData,
  time: number
};

const DEFAULT_CACHING_TIME = 60; // seconds

/**
 * Blockscout class provides a client abstraction for the Immutable 3rd party indexer.
 */
export class Blockscout {
  readonly url: string;

  private cacheData: Map<string, Cache>;

  readonly cacheTTL: number;

  /**
   * Blockscout constructor
   * @param chainId target chain
   */
  constructor(params: { chainId: ChainId, caching?: number }) {
    this.url = BLOCKSCOUT_CHAIN_URL_MAP[params.chainId];
    this.cacheData = new Map();
    this.cacheTTL = (params.caching ?? DEFAULT_CACHING_TIME) * 1000;
  }

  private static async makeHttpRequest(url: string): Promise<AxiosResponse> {
    return axios.get(url);
  }

  private getCache = (key: string): (CacheData | null) => {
    const data = this.cacheData.get(key);
    if (!data) return null;
    if (data.time <= new Date().getTime()) return null;
    return data.data;
  };

  private setCache = (key: string, data: CacheData) => {
    this.cacheData.set(key, { data, time: new Date().getTime() + this.cacheTTL });
  };

  /**
   * isChainSupported verifies if the chain is supported by Blockscout
   * @param chainId
   */
  public static isChainSupported = (chainId: ChainId): boolean => Boolean(BLOCKSCOUT_CHAIN_URL_MAP[chainId]);

  /**
   * isBlockscoutError verifies if the error is a Blockscout error.
   * @param err Error
   */
  public static isBlockscoutError = (err: any): boolean => Object.hasOwn(err, 'code');

  /**
   * getAddressTokens fetches the list of tokens (by type) owned by the wallet address.
   * @param walletAddress wallet address
   * @param tokenType token types
   * @param next parameters for the next page, to be provided along side walletAddress and tokenType
   * @returns list of tokens given the wallet address and the token types
   */
  public async getAddressTokens(params: {
    walletAddress: string,
    tokenType: BlockscoutTokenType[],
    next?: BlockscoutAddressTokenPagination | null
  }): Promise<BlockscoutAddressTokens> {
    try {
      let url = `${this.url}/api/v2/addresses/${params.walletAddress}/tokens?type=${params.tokenType.join(',')}`;
      if (params.next) url += `&${new URLSearchParams(params.next as Record<string, string>)}`;

      const cached = this.getCache(url);
      if (cached) return cached;

      const response = await Blockscout.makeHttpRequest(url);

      if (response.status >= 400) {
        return Promise.reject({ code: response.status, message: response.statusText });
      }

      this.setCache(url, response.data);
      return Promise.resolve(response.data);
    } catch (err: any) {
      return Promise.reject({
        code: err.code ?? HttpStatusCode.InternalServerError,
        message: err.message || 'InternalServerError',
      });
    }
  }
}

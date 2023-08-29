import axios, {
  AxiosResponse,
  HttpStatusCode,
} from 'axios';
import { BLOCKSCOUNT_CHAIN_URL_MAP, ChainId } from '../types';
import {
  BlockscoutAddressTokenPagination,
  BlockscoutAddressTokens,
  BlockscoutTokenType,
} from './blockscoutType';

/**
 * Blockscout class provides a client abstraction for the Immutable 3rd party indexer.
 */
export class Blockscout {
  readonly url: string;

  /**
   * Blockscout constructor
   * @param chainId target chain
   */
  constructor(params: {
    chainId: ChainId;
  }) {
    this.url = BLOCKSCOUNT_CHAIN_URL_MAP[params.chainId];
  }

  /**
   * isChainSupported verifies if the chain is supported by Blockscout
   * @param chainId
   * @returns TRUE if supported, otherwise FALSE
   */
  public static isChainSupported = (chainId: ChainId): boolean => Boolean(BLOCKSCOUNT_CHAIN_URL_MAP[chainId]);

  public static isBlockscoutError = (err: any): boolean => Object.hasOwn(err, 'code');

  private static async makeHttpRequest(url: string): Promise<AxiosResponse> {
    return axios.get(url);
  }

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
    next?: BlockscoutAddressTokenPagination
  }): Promise<BlockscoutAddressTokens> {
    try {
      let url = `${this.url}/api/v2/addresses/${params.walletAddress}/tokens?type=${params.tokenType.join(',')}`;
      if (params.next) url += `&${new URLSearchParams(params.next as Record<string, string>)}`;

      const response = await Blockscout.makeHttpRequest(url);

      if (response.status >= 400) {
        return Promise.reject({ code: response.status, message: response.statusText });
      }

      return Promise.resolve(response.data);
    } catch (err: any) {
      return Promise.reject({
        code: err.code ?? HttpStatusCode.InternalServerError,
        message: err.message ?? 'InternalServerError',
      });
    }
  }
}

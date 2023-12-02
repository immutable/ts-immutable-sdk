import axios, { AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import { Environment } from '@imtbl/config';
import { CHECKOUT_API_BASE_URL } from '@imtbl/checkout-sdk/src/env';
import { TransactionType, Transactions } from './checkoutApiType';

type CacheData = {
  data: any,
  ttl: number
};

type GetTransactions = {
  type: TransactionType,
  fromAddress: string,
};

const CACHE_DATA_TTL = 0; // seconds

/**
 * Checkout API class provides a client abstraction for the Checkout API.
 */
export class CheckoutApi {
  readonly url: string;

  readonly ttl: number;

  readonly env: Environment;

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
   * Checkout API constructor
   * @param env target chain
   * @param ttl cache TTL
   */
  constructor(params: {
    env: Environment;
    ttl?: number
  }) {
    this.env = params.env;
    this.url = CHECKOUT_API_BASE_URL[this.env];

    this.cacheMap = {};
    this.ttl = params.ttl !== undefined ? params.ttl : CACHE_DATA_TTL;
  }

  /**
   * isHttpError verifies if the error is a HTTP error
   * @param err error to evaluate
   */
  public static isHttpError = (err: any): boolean => 'code' in err;

  /**
   * getNativeTokenByWalletAddress fetches a list of blockchain transactions.
   * @param type transaction type
   * @param fromAddress transactions executed from address
   */
  public async getTransactions(params: GetTransactions): Promise<Transactions> {
    const { type, fromAddress } = params;

    try {
      const url = `${this.url}/v1/transaction&from_address=${fromAddress}?type=${type}`;

      // Cache response data to prevent unnecessary requests
      const cached = this.getCache(url);
      if (cached) return Promise.resolve(cached);

      const response = await CheckoutApi.makeHttpRequest(url);
      if (response.status >= 400) {
        return Promise.reject({
          code: response.status,
          message: response.statusText,
        });
      }

      const { data } = response;

      this.setCache(url, data);
      return Promise.resolve(data);
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
}

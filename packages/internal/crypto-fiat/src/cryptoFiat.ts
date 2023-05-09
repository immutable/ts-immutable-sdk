import axios from 'axios';
import { CryptoFiatConfiguration } from 'config';
import {
  CryptoFiatConvertParams,
  CryptoFiatConvertReturn,
  FiatConversion,
} from 'types';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_PRO_BASE_URL = 'https://pro-api.coingecko.com/api/v3';

const DEFAULT_FIAT_SYMBOL = 'usd';

/**
 * CryptoFiat module class
 */
export class CryptoFiat {
  private cache: Map<string, string> | null;

  private apiKey?: string;

  /**
   * Creates an instance of CryptoFiat.
   * @param {CryptoFiatConfiguration} conf - configuration parameters for the module
   */
  constructor(conf: CryptoFiatConfiguration) {
    this.cache = null;
    this.apiKey = conf.getApiKey();
  }

  private withApiKey(path: string): string {
    if (!this.apiKey) return `${COINGECKO_API_BASE_URL}${path}`;
    const glue = path.indexOf('?') === -1 ? '?' : '&';
    return `${COINGECKO_API_PRO_BASE_URL}${path}${glue}x_cg_pro_api_key=${this.apiKey}`;
  }

  private async fetchSymbols(): Promise<void> {
    if (this.cache !== null) return;

    const url = this.withApiKey('/coins/list');
    const response = await axios.get(url);

    if (response.status !== 200) {
      throw new Error(
        `Error fetching coin list: ${response.status} ${response.statusText}`,
      );
    }

    const { data } = response;

    this.cache = new Map<string, string>();
    for (const coin of data) {
      this.cache.set(coin.symbol.toUpperCase(), coin.id.toLowerCase());
    }
  }

  /**
   * Converts tokens with fiat currencies.
   * @param {CryptoFiatConvertParams} - object containing the token symbols to get a conversion
   *                                    for and the optional fiat symbols to convert to.
   * @returns {Promise<CryptoFiatConvertReturn>} - promise to return the map that associates
   *                                               token symbol to its conversion value object
   *                                               with fiat currencies.
   */
  async convert({
    tokenSymbols,
  }: CryptoFiatConvertParams): Promise<CryptoFiatConvertReturn> {
    if (!tokenSymbols || tokenSymbols.length === 0) {
      throw new Error('Error missing token symbols to convert');
    }

    await this.fetchSymbols();

    const ids = tokenSymbols
      .map((s) => this.cache!.get(s.toUpperCase()))
      .join(',');
    const url = this.withApiKey(
      `/simple/price?ids=${ids}&vs_currencies=${DEFAULT_FIAT_SYMBOL}`,
    );

    const response = await axios.get(url);

    if (response.status !== 200) {
      throw new Error(
        `Error fetching prices: ${response.status} ${response.statusText}`,
      );
    }

    const { data } = response;

    const result = new Map<string, FiatConversion>();
    for (const symbol of tokenSymbols) {
      const id = this.cache!.get(symbol.toUpperCase());
      id ? result.set(symbol, data[id] || {}) : result.set(symbol, {});
    }

    return result;
  }
}

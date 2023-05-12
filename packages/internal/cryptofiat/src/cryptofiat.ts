import axios from 'axios';
import { CryptoFiatConfiguration } from 'config';
import { CryptoFiatConvertParams, CryptoFiatConvertReturn } from 'types';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_PRO_BASE_URL = 'https://pro-api.coingecko.com/api/v3';

const DEFAULT_FIAT_SYMBOL = 'usd';

// Given that we could have multiple coins with the same symbol and CoinGecko
// does not support chain id then we are forcing the conversion.
// Coin conversion list: https://api.coingecko.com/api/v3/coins/list
const symbolsOverrides: { [symbol: string]: string } = {
  eth: 'ethereum',
  usdc: 'usd-coin',
};

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
      const override = symbolsOverrides[coin.symbol.toLowerCase()];
      this.cache.set(
        coin.symbol.toLowerCase(),
        override || coin.id.toLowerCase(),
      );
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
    fiatSymbols = [],
  }: CryptoFiatConvertParams): Promise<CryptoFiatConvertReturn> {
    if (!tokenSymbols || tokenSymbols.length === 0) {
      throw new Error('Error missing token symbols to convert');
    }

    if (fiatSymbols.length === 0) fiatSymbols.push(DEFAULT_FIAT_SYMBOL);

    await this.fetchSymbols();

    const ids = tokenSymbols
      .map((s) => this.cache!.get(s.toLowerCase()))
      .join(',');
    const url = this.withApiKey(
      `/simple/price?ids=${ids}&vs_currencies=${fiatSymbols
        .join(',')
        .toLowerCase()}`,
    );

    const response = await axios.get(url);
    if (response.status !== 200) {
      throw new Error(
        `Error fetching prices: ${response.status} ${response.statusText}`,
      );
    }

    const { data } = response;

    const result: CryptoFiatConvertReturn = {};
    for (const symbol of tokenSymbols) {
      const symbolKey = symbol.toLowerCase();
      const coinId = this.cache!.get(symbolKey);
      result[symbolKey] = {};
      if (coinId) result[symbolKey] = data[coinId] || {};
    }

    return result;
  }
}

import { Environment, ImmutableConfiguration } from '@imtbl/config';
import axios from 'axios';
import { CryptoFiatConfiguration } from 'config';
import { CryptoFiatConvertParams, CryptoFiatConvertReturn } from 'types';

const CHECKOUT_API_BASE_URL = {
  [Environment.SANDBOX]: 'https://checkout-api.sandbox.immutable.com',
  // TODO: https://immutable.atlassian.net/browse/WT-1425
  [Environment.PRODUCTION]: 'https://checkout-api.sandbox.immutable.com',
};

const DEFAULT_FIAT_SYMBOL = 'usd';

/**
 * CryptoFiat module class
 */
export class CryptoFiat {
  private coinsCache: Map<string, string> | null;

  private overridesCache: Map<string, string> | null;

  public config: ImmutableConfiguration;

  /**
   * Creates an instance of CryptoFiat.
   * @param {CryptoFiatConfiguration} config - configuration parameters for the module
   */
  constructor(config: CryptoFiatConfiguration) {
    this.coinsCache = null;
    this.overridesCache = null;
    this.config = config.baseConfig;
  }

  private urlWithPath(path: string): string {
    return CHECKOUT_API_BASE_URL[this.config.environment] + path;
  }

  // Given that we could have multiple coins with the same symbol
  // and we do not have the contract address we are forcing the
  // conversion because we are using coingecko under the hood.
  private async fetchOverrides(): Promise<void> {
    if (this.overridesCache !== null) return;

    const url = this.urlWithPath('/v1/fiat/coins/overrides');
    const response = await axios.get(url);

    if (response.status !== 200) {
      throw new Error(
        `Error fetching coins overrides: ${response.status} ${response.statusText}`,
      );
    }

    this.overridesCache = new Map(Object.entries(response.data));
  }

  private async fetchCoins(): Promise<void> {
    if (this.coinsCache !== null) return;

    await this.fetchOverrides();

    const url = this.urlWithPath('/v1/fiat/coins/all');
    const response = await axios.get(url);

    if (response.status !== 200) {
      throw new Error(
        `Error fetching coins list: ${response.status} ${response.statusText}`,
      );
    }

    const { data } = response;

    this.coinsCache = new Map<string, string>();
    for (const coin of data) {
      const override = this.overridesCache!.get(coin.symbol.toLowerCase());
      this.coinsCache.set(
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

    const currencies = fiatSymbols.filter((fiatSymbol) => fiatSymbol !== '');
    if (currencies.length === 0) currencies.push(DEFAULT_FIAT_SYMBOL);

    await this.fetchCoins();

    const idsParam = tokenSymbols
      .map((tokenSymbol) => this.coinsCache!.get(tokenSymbol.toLowerCase()))
      .filter((tokenSymbol) => tokenSymbol !== '' && tokenSymbol !== undefined)
      .join(',');

    const currenciesParam = currencies
      .join(',')
      .toLowerCase();

    const url = this.urlWithPath(`/v1/fiat/conversion?ids=${idsParam}&currencies=${currenciesParam}`);

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
      const coinId = this.coinsCache!.get(symbolKey);
      result[symbolKey] = {};
      if (coinId) result[symbolKey] = data[coinId] || {};
    }

    return result;
  }
}

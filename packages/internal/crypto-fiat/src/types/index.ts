/**
 * Interface representing the configuration for the CryptoFiatModule.
 * @property {string} apiKey - Optional, API key for accessing the CryptoFiatModule.
 */
export interface CryptoFiatModuleConfiguration {
  apiKey?: string;
}

/**
 * Type representing the parameters for converting cryptocurrency to fiat.
 * @property {string[]} tokenSymbols - Array of cryptocurrency symbols to convert.
 */
export type CryptoFiatConvertParams = {
  tokenSymbols: string[];
};

/**
 * Type representing the fiat conversion rates for a specific cryptocurrency.
 * @property {[fiatSymbol: string]: number} - Conversion rate of the cryptocurrency
 *                                            to the fiat currency.
 */
export type FiatConversion = {
  [fiatSymbol: string]: number;
};

/**
 * Type representing the return value of the conversion function.
 * @property {Map<string, FiatConversion>} - Conversion rates of all the cryptocurrency
 *                                           to all the fiat currencies.
 */
export type CryptoFiatConvertReturn = Map<string, FiatConversion>;

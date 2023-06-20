import { ModuleConfiguration } from '@imtbl/config';

/**
 * Interface representing the overrides options for the CryptoFiatModuleConfiguration.
 */
export interface CryptoFiatOverrides {}

/**
 * Interface representing the configuration for the CryptoFiatModule.
 */
export interface CryptoFiatModuleConfiguration
  extends ModuleConfiguration<CryptoFiatOverrides> {
}

/**
 * Type representing the parameters for converting cryptocurrency to fiat.
 * @property {string[]} tokenSymbols - Array of cryptocurrency symbols to convert.
 */
export type CryptoFiatConvertParams = {
  tokenSymbols: string[];
  fiatSymbols?: string[];
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
 * @property { [tokenSymbol: string]: FiatConversion } - Conversion rates of all the cryptocurrency
 *                                               to all the fiat currencies.
 */
export type CryptoFiatConvertReturn = { [tokenSymbol: string]: FiatConversion };

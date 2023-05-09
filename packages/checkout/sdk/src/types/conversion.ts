import { TokenInfo } from './token';
import { BigNumber } from 'ethers';

/**
 * Enum representing the types of token filters available.
 */
export enum SupportedFiatCurrencies {
  USD = 'USD',
}

/**
 * Interface representing the parameters for {@link Checkout.convertTokenToFiat}.
 * @property {BigNumber} amount - The the amount of token we are converting.
 * @property {TokenInfo} token - The token we are converting from.
 * @property {SupportedFiatCurrencies}  fiatSymbol - The fiat currency we are converting to.
 */
export interface ConvertTokensToFiatParams {
  amounts: {
    [key: string]: {
      amount: BigNumber;
      token: TokenInfo;
    };
  };
  fiatSymbol: SupportedFiatCurrencies;
}

/**
 * Interface representing the result of a specific token to fiat conversion.
 * @property {TokenInfo} token - The token that we converted from.
 * @property {string} fiatSymbol - The fiat currency we converted to.
 * @property {number} quotedAt - The unix timestamp for when the quote was generated.
 * @property {number} quote - The quote at the given timestamp.
 * @property {BigNumber} amount - The amount we converted.
 * @property {number} convertedAmount - The converted amount.
 */
export interface TokenToFiatConversionResult extends FiatConversionQuote {
  token: TokenInfo;
  fiatSymbol: string;
  amount: BigNumber;
  convertedAmount: number;
}

/**
 * Interface representing the result of {@link Checkout.convertTokenToFiat}.
 */
export interface ConvertTokensToFiatResult {
  [key: string]: TokenToFiatConversionResult;
}

/**
 * Interface representing the result of a specific token to fiat conversion.
 * @property {number} quotedAt - The unix timestamp for when the quote was generated.
 * @property {number} quote - The quote at the given timestamp.
 */
export interface FiatConversionQuote {
  quote: number;
  quotedAt: number;
}

/**
 * Interface representing the transformed api result for currency conversion quotes.
 */
export interface FetchQuotesResult {
  [key: string]: FiatConversionQuote;
}

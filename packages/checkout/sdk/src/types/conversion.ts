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
 * Interface representing the result of {@link Checkout.convertTokenToFiat}.
 * @property {TokenInfo} token - The token that we converted from.
 * @property {string} fiatSymbol - The fiat currency we converted to.
 * @property {number} quotedAt - The unix timestamp for when the quote was generated.
 * @property {number} quote - The quote at the given timestamp.
 * @property {BigNumber} amount - The amount we converted.
 * @property {number} convertedAmount - The converted amount.
 */

export interface TokenToFiatConversion {
  token: TokenInfo;
  fiatSymbol: string;
  quotedAt: number;
  quote: number;
  amount: BigNumber;
  convertedAmount: number;
}

export interface ConvertTokensToFiatResult {
  [key: string]: TokenToFiatConversion;
}

export interface FiatConversionQuote {
  quote: number;
  quotedAt: number;
}

export interface FetchQuotesResult {
  [key: string]: FiatConversionQuote;
}

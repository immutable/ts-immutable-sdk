import { ChainId } from './network';
import { BigNumber } from 'ethers';

/**
 * Interface representing token information.
 * @property {string} name - The token name.
 * @property {string} symbol - The token symbol.
 * @property {number} decimals - The token decimals.
 * @property {string} [address] - The token contract address.
 * @property {string} [icon] - The token icon URL/data:image.
 */
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address?: string;
  icon?: string;
}

/**
 * Interface representing token information for a specific chain.
 * @extends {TokenInfo}
 * @property {ChainId} chainId - The ID of the blockchain network.
 * @property {TokenFilterTypes[]} tokenFeatures - The features supported by the token.
 */
export interface TokenMasterInfo extends TokenInfo {
  chainId: ChainId;
  tokenFeatures: TokenFilterTypes[];
}

/**
 * Interface representing the parameters for {@link Checkout.getTokenAllowList}.
 * @property {TokenFilterTypes} type - The type of token to retrieve.
 * @property {ChainId}  chainId - The ID of the blockchain network.
 * @property {TokenFilter[]} [exclude] - The tokens to exclude from the list.
 */
export interface GetTokenAllowListParams {
  type: TokenFilterTypes;
  chainId?: ChainId;
  exclude?: TokenFilter[];
}

/**
 * Interface representing the result of {@link Checkout.getTokenAllowList}.
 * @property {TokenInfo[]} tokens - The list of tokens allowed for the specified params.
 */
export interface GetTokenAllowListResult {
  tokens: TokenInfo[];
}

/**
 * Enum representing the types of token filters available.
 */
export enum TokenFilterTypes {
  SWAP = 'swap',
  BRIDGE = 'bridge',
  ALL = 'all',
}

/**
 * Interface representing a token filter that can be used to exclude certain tokens.
 * @property {string} address - The token contract address.
 */
export interface TokenFilter {
  address: string;
}

/**
 * Enum representing the types of token filters available.
 */
export enum SupportFiatCurrencies {
  USD = 'USD',
}

/**
 * Interface representing the parameters for {@link Checkout.convertTokenToFiat}.
 * @property {BigNumber} amount - The the amount of token we are converting.
 * @property {TokenInfo} token - The token we are converting from.
 * @property {SupportFiatCurrencies}  fiatSymbol - The fiat currency we are converting to.
 */
export interface ConvertTokenToFiatParams {
  amount: BigNumber;
  token: TokenInfo;
  fiatSymbol: SupportFiatCurrencies;
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
export interface ConvertTokenToFiatResult {
  token: TokenInfo;
  fiatSymbol: string;
  quotedAt: number;
  quote: number;
  amount: BigNumber;
  convertedAmount: number;
}

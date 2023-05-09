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

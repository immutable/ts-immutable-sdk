import { JsonRpcProvider } from 'ethers';
import { WrappedBrowserProvider } from './provider';

/**
 * Represents information about a token.
 * @interface TokenInfo
 * @property {string} name - The name of the token.
 * @property {string} symbol - The symbol of the token.
 * @property {number} decimals - The number of decimal places the token supports.
 * @property {string | undefined} [address] - The address of the token.
 * @property {string | undefined} [icon] - The URL of the token's icon.
 */
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address?: string;
  icon?: string;
}

/**
 * A type representing the token info with bridge details.
 * @extends {TokenInfo}
 * @property {string | null} bridge - The bridge used to bridge the token.
 */
export interface TokenBridgeInfo extends TokenInfo {
  bridge: string | null;
}

/**
 * Interface representing the parameters for {@link Checkout.getTokenInfo}.
 * @property {WrappedBrowserProvider | JsonRpcProvider} provider - The provider used to get the balance.
 * @property {string} tokenAddress - The contract address of the token.
 */
export interface GetTokenInfoParams {
  provider: WrappedBrowserProvider | JsonRpcProvider;
  tokenAddress: string;
}

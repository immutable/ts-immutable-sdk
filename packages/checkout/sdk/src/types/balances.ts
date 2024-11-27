import { Eip1193Provider } from 'ethers';
import { ChainId } from './chains';
import { TokenInfo } from './tokenInfo';
import { WrappedBrowserProvider } from './provider';

/**
 * Interface representing the parameters for {@link Checkout.getBalance}.
 * @property {BrowserProvider} provider - The provider used to get the balance.
 * @property {string} walletAddress - The wallet address.
 * @property {string | undefined} tokenAddress - The contract address of the token.
 */
export interface GetBalanceParams {
  provider: WrappedBrowserProvider;
  walletAddress: string;
  tokenAddress?: string;
}

/**
 * Interface representing the result of {@link Checkout.getBalance}.
 * @property {bigint} balance - The balance of the wallet for the token.
 * @property {string} formattedBalance - The formatted balance of the wallet for the token.
 * @property {TokenInfo} token - The token information.
 */
export interface GetBalanceResult {
  balance: bigint;
  formattedBalance: string;
  token: TokenInfo;
}

/**
 * Interface representing the parameters for {@link Checkout.getAllBalances}.
 * @property {BrowserProvider} provider - The provider used to get the balances, it is a required parameter if no walletAddress is provided.
 * @property {string} walletAddress - The wallet address, it is a required parameter if no provider is provided.
 * @property {ChainId} chainId - The ID of the network.
 */
export interface GetAllBalancesParams {
  provider?: WrappedBrowserProvider | Eip1193Provider;
  walletAddress?: string;
  chainId: ChainId;
}

/**
 * Interface representing the result of {@link Checkout.getAllBalances}.
 * @property {GetBalanceResult[]} balances - The array of balances of the wallet for every token.
 */
export interface GetAllBalancesResult {
  balances: GetBalanceResult[];
}

/**
 * Interface representing the result of {@link Checkout.getBalances}.
 * @property {GetBalanceResult[]} balances - The array of balances of the wallet specific tokens.
 */
export interface GetBalancesResult {
  balances: GetBalanceResult[];
}

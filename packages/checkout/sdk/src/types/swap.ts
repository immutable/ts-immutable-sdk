import { Quote, TransactionDetails } from '@imtbl/dex-sdk';
import { TransactionReceipt, Eip1193Provider } from 'ethers';
import { TokenInfo } from './tokenInfo';
import { WrappedBrowserProvider } from './provider';

/**
 * Interface representing the parameters for {@link Checkout.swap}.
 * @property {BrowserProvider} provider - The provider used to get the wallet address.
 * @property {TokenInfo} fromToken - The token to swap from.
 * @property {TokenInfo} toToken - The token to swap to.
 * @property {string | undefined} fromAmount - The amount to swap from.
 * @property {string | undefined} toAmount - The amount to swap to.
 * @property {number | undefined} slippagePercent - The percentage of slippage tolerance. Default = 0.1. Max = 50. Min = 0
 * @property {number | undefined} maxHops - Maximum hops allowed in optimal route. Default is 2
 * @property {number | undefined} deadline - Latest time swap can execute. Default is 15 minutes
 */

export interface SwapParams {
  provider: WrappedBrowserProvider | Eip1193Provider;
  fromToken: TokenInfo,
  toToken: TokenInfo,
  fromAmount?: string,
  toAmount?: string,
  slippagePercent?: number,
  maxHops?: number,
  deadline?: number,
}

/**
 * Interface representing the result of {@link Checkout.swapQuote}.
 * @property {TransactionDetails} approval - The approval transaction details.
 * @property {TransactionDetails} swap - The swap transaction details.
 * @property {Quote} quote - The quote for the swap.
 */
export interface SwapQuoteResult {
  approval: TransactionDetails | null;
  swap: TransactionDetails;
  quote: Quote;
}

/**
 * Interface representing the result of {@link Checkout.swap}.
 * @property {TransactionDetails} swap - The swap transaction details.
 * @property {Quote} quote - The quote for the swap.
 * @property {TransactionReceipt} swapReceipt - The receipt of the swap transaction.
 */
export interface SwapResult {
  swap: TransactionDetails;
  quote: Quote;
  swapReceipt: TransactionReceipt | null;
}

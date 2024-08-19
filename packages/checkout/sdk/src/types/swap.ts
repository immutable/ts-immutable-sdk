import { Web3Provider } from '@ethersproject/providers';
import { Quote, TransactionDetails } from '@imtbl/dex-sdk';
import { TokenInfo } from './tokenInfo';

/**
 * Interface representing the parameters for {@link Checkout.swap}.
 * @property {Web3Provider} provider - The provider used to get the wallet address.
 * @property {TokenInfo} fromToken - The token to swap from.
 * @property {TokenInfo} toToken - The token to swap to.
 * @property {string | undefined} fromAmount - The amount to swap from.
 * @property {string | undefined} toAmount - The amount to swap to.
 */

export interface SwapParams {
  provider: Web3Provider;
  fromToken: TokenInfo,
  toToken: TokenInfo,
  fromAmount?: string,
  toAmount?: string,
}

/**
 * Interface representing the result of {@link Checkout.swap}.
 * @property {TransactionDetails} approval - The approval transaction details.
 * @property {TransactionDetails} swap - The swap transaction details.
 * @property {Quote} quote - The quote for the swap.
 */
export interface SwapResult {
  approval: TransactionDetails | null;
  swap: TransactionDetails;
  quote: Quote;
}

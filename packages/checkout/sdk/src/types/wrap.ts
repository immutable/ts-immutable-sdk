import { TransactionReceipt, TransactionResponse, Web3Provider } from '@ethersproject/providers';

/**
 * Enum representing the direction of wrapping.
 * @enum {string}
 */
export enum WrapDirection {
  WRAP = 'wrap',
  UNWRAP = 'unwrap',
}

/**
 * Interface representing the parameters for {@link Checkout.wrapIMX}.
 * @property {Web3Provider} provider - The provider used to get the wallet address.
 * @property {string} amount - The amount of IMX to wrap.
 * @property {WrapDirection} direction - Dictates if token is being wrapped or unwrapped.
 */
export interface WrapParams {
  provider: Web3Provider;
  amount: string,
  direction: WrapDirection,
}

/**
 * Interface representing the result of {@link Checkout.wrapIMX}.
 * @property {TransactionDetails} wrap - The wrap transaction details.
 * @property {TransactionReceipt} receipt - The receipt of the wrap transaction.
 */
export interface WrapResult {
  transaction: TransactionResponse;
  receipt: TransactionReceipt;
}

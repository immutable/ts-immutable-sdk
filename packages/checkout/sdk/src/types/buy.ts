import { Web3Provider } from '@ethersproject/providers';
import {
  SmartCheckoutResult, UnsignedTransactions,
} from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.buy}
 * @property {Web3Provider} provider - The provider to use for the buy.
 * @property {string} orderId - The order ID.
 * @property {boolean} [executeTransactions] - Whether the transactions should be executed if the user is able to complete the buy.
 */
export interface BuyParams {
  provider: Web3Provider;
  orderId: string;
  executeTransactions?: boolean;
}

/**
 * Interface representing the result of the buy
 * @property {SmartCheckoutResult} smartCheckoutResult - The result of smart checkout.
 * @property {UnsignedTransactions | undefined} transactions - Unsigned transactions, present when
 * smart checkout returns sufficient true and executeTransactions is true.
 */
export type BuyResult = {
  smartCheckoutResult: SmartCheckoutResult,
  transactions?: UnsignedTransactions,
};

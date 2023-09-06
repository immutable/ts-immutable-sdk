import { Web3Provider } from '@ethersproject/providers';
import { SmartCheckoutResult } from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.buy}
 * @property {Web3Provider} provider - The provider to use for the buy.
 * @property {string} orderId - The order ID.
 */
export interface BuyParams {
  provider: Web3Provider;
  orderId: string;
}

/**
 * Interface representing the result of the buy
 * @property {SmartCheckoutResult} smartCheckoutResult - The result of smart checkout.
 */
export type BuyResult = {
  smartCheckoutResult: SmartCheckoutResult,
};

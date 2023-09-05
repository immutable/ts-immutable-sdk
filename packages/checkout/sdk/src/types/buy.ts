import { Web3Provider } from '@ethersproject/providers';
import {
  SmartCheckoutResult, UnsignedActions,
} from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.buy}
 * @property {Web3Provider} provider - The provider to use for the buy.
 * @property {string} orderId - The order ID.
 * @property {boolean} [signActions] - Whether unsigned messages and transactions should be
 * executed if the user is able to complete the buy.
 */
export interface BuyParams {
  provider: Web3Provider;
  orderId: string;
  signActions?: boolean;
}

/**
 * Interface representing the result of the buy
 * @property {SmartCheckoutResult} smartCheckoutResult - The result of smart checkout.
 * @property {UnsignedActions | undefined} transactions - Unsigned actions, present when
 * smart checkout returns sufficient true and signActions false.
 */
export type BuyResult = {
  smartCheckoutResult: SmartCheckoutResult,
  unsignedActions?: UnsignedActions,
};

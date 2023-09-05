import { Web3Provider } from '@ethersproject/providers';
import { UnsignedActions } from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.cancel}
 * @property {Web3Provider} provider - The provider to use for the cancel.
 * @property {string} orderId - The order ID.
 * @property {boolean} [signActions] - Whether unsigned messages and transactions should be
 * executed.
 */
export interface CancelParams {
  provider: Web3Provider;
  orderId: string;
  signActions?: boolean;
}

/**
 * Interface representing the result of the cancel
 *  * @property {UnsignedActions | undefined} transactions - Unsigned actions present when signActions is false.
 */
export type CancelResult = {
  unsignedActions?: UnsignedActions,
};

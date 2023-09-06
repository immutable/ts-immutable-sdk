import { Web3Provider } from '@ethersproject/providers';

/**
 * Interface representing the parameters for {@link Checkout.cancel}
 * @property {Web3Provider} provider - The provider to use for the cancel.
 * @property {string} orderId - The order ID.
 */
export interface CancelParams {
  provider: Web3Provider;
  orderId: string;
}

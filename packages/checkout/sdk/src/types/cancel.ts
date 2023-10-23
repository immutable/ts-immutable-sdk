import { Web3Provider } from '@ethersproject/providers';

/**
 * Interface representing the parameters for {@link Checkout.cancel}
 * @property {Web3Provider} provider - The provider to use for the cancel.
 * @property {string[]} orderIds - The order IDs to cancel.
 * Currently only processes the first order in the array until batch processing is supported.
 */
export interface CancelParams {
  provider: Web3Provider;
  orderIds: string[];
}

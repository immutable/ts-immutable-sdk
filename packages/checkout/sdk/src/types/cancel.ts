import { Web3Provider } from '@ethersproject/providers';

/**
 * Interface representing the parameters for {@link Checkout.cancel}
 * @property {Web3Provider} provider - The provider to use for the cancel.
 * @property {string[]} orderIds - The order IDs to cancel.
 */
export interface CancelParams {
  provider: Web3Provider;
  orderIds: string[];
}

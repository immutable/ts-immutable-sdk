import { Web3Provider } from '@ethersproject/providers';
import { SellOrder } from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.sell}
 * @property {Web3Provider} provider - The provider to use for the sell.
 * @property {Array<SellOrder>} orders - An array of sell orders to execute.
 * Only currently actions the first order in the array until we support batch processing.
 */
export interface SellParams {
  provider: Web3Provider;
  orders: Array<SellOrder>;
}

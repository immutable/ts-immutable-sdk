import { Web3Provider } from '@ethersproject/providers';
import { SellOrder, SellOverrides } from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.sell}
 * @property {Web3Provider} provider - The provider to use for the sell.
 * @property {Array<SellOrder>} orders - An array of sell orders to execute.
 * Currently only processes the first order in the array until batch processing is supported.
 */
export interface SellParams {
  provider: Web3Provider;
  orders: Array<SellOrder>;
  overrides?: SellOverrides;
}

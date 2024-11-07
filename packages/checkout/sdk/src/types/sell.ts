import { BrowserProvider } from 'ethers';
import { SellOrder } from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.sell}
 * @property {BrowserProvider} provider - The provider to use for the sell.
 * @property {Array<SellOrder>} orders - An array of sell orders to execute.
 * Currently only processes the first order in the array until batch processing is supported.
 */
export interface SellParams {
  provider: BrowserProvider;
  orders: Array<SellOrder>;
}

import { SellOrder } from './smartCheckout';
import { NamedBrowserProvider } from './provider';

/**
 * Interface representing the parameters for {@link Checkout.sell}
 * @property {BrowserProvider} provider - The provider to use for the sell.
 * @property {Array<SellOrder>} orders - An array of sell orders to execute.
 * Currently only processes the first order in the array until batch processing is supported.
 */
export interface SellParams {
  provider: NamedBrowserProvider;
  orders: Array<SellOrder>;
}

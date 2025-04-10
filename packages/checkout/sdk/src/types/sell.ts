import { Eip1193Provider } from 'ethers';
import { SellOrder } from './smartCheckout';
import { WrappedBrowserProvider } from './provider';

/**
 * Interface representing the parameters for {@link Checkout.sell}
 * @property {WrappedBrowserProvider | Eip1193Provider} provider - The provider to use for the sell.
 * @property {Array<SellOrder>} orders - An array of sell orders to execute.
 * Currently only processes the first order in the array until batch processing is supported.
 */
export interface SellParams {
  provider: WrappedBrowserProvider | Eip1193Provider;
  orders: Array<SellOrder>;
}

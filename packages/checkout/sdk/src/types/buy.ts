import { Eip1193Provider } from 'ethers';
import { WrappedBrowserProvider } from './provider';
import { BuyOrder, BuyOverrides } from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.buy}
 * @property {WrappedBrowserProvider | Eip1193Provider} provider - The provider to use for the buy.
 * @property {Array<BuyOrder>} orders - The orders to buy
 * @property {BuyOverrides} overrides - The overrides to use for the buy.
 * Currently only processes the first order in the array until batch processing is supported.
 */
export interface BuyParams {
  provider: WrappedBrowserProvider | Eip1193Provider;
  orders: Array<BuyOrder>;
  overrides?: BuyOverrides;
}

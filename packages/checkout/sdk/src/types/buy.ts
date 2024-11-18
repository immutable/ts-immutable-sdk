import { NamedBrowserProvider } from './provider';
import { BuyOrder, BuyOverrides } from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.buy}
 * @property {BrowserProvider} provider - The provider to use for the buy.
 * @property {Array<BuyOrder>} orders - The orders to buy
 * @property {BuyOverrides} overrides - The overrides to use for the buy.
 * Currently only processes the first order in the array until batch processing is supported.
 */
export interface BuyParams {
  provider: NamedBrowserProvider;
  orders: Array<BuyOrder>;
  overrides?: BuyOverrides;
}

import { Web3Provider } from '@ethersproject/providers';
import { BuyOrder } from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.buy}
 * @property {Web3Provider} provider - The provider to use for the buy.
 * @property {Array<BuyOrder>} orders - The orders to buy
 */
export interface BuyParams {
  provider: Web3Provider;
  orders: Array<BuyOrder>;
}

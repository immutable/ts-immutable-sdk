import { Web3Provider } from '@ethersproject/providers';
import { ItemRequirement, GasToken } from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.buy}
 * @property {Web3Provider} provider - The provider to use for the buy.
 * @property {string} orderId - The order ID.
 */
export interface BuyParams {
  provider: Web3Provider;
  orderId: string;
}

/**
 * Interface representing the result of the buy
 * @property {ItemRequirement[]} itemRequirements - The item requirements for the buy.
 * @property {GasToken} gasToken - The gas token used for the buy.
 */
export type BuyResult = {
  itemRequirements: ItemRequirement[],
  gasToken: GasToken,
};

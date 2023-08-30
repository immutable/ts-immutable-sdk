import { Web3Provider } from '@ethersproject/providers';
import {
  ItemRequirement, GasToken, ItemType, SmartCheckoutResult,
} from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.sell}
 * @property {Web3Provider} provider - The provider to use for the sell.
 * @property {string} orderId - The order ID.
 */
export interface SellParams {
  provider: Web3Provider;
  id: string;
  collectionAddress: string;
  buyToken: BuyToken;
}

/**
 * Interface representing the result of the sell
 * @property {ItemRequirement[]} itemRequirements - The item requirements for the sell.
 * @property {GasToken} gasToken - The gas token used for the sell.
 * @property {SmartCheckoutResult} smartCheckoutResult - The result of the smart checkout.
 */
export type SellResult = {
  itemRequirements: ItemRequirement[],
  gasToken: GasToken,
  smartCheckoutResult: SmartCheckoutResult,
};

export type BuyToken = NativeBuyToken | ERC20BuyToken;

type NativeBuyToken = {
  type: ItemType.NATIVE;
  amount: string;
};

type ERC20BuyToken = {
  type: ItemType.ERC20;
  contractAddress: string;
  amount: string;
};

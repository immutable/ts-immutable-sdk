import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  ItemRequirement, GasToken, ItemType, SmartCheckoutResult,
} from './smartCheckout';

/**
 * Interface representing the parameters for {@link Checkout.sell}
 * @property {Web3Provider} provider - The provider to use for the sell.
 * @property {string} id - The ERC721 ID.
 * @property {string} collectionAddress - The contract address of the ERC721s collection.
 * @property {BuyToken} buyToken - The token to buy the item with.
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

/**
 * Represents the token that the item can be bought with once listed for sale.
 * NativeBuyToken or ERC20BuyToken {@link Checkout.smartCheckout}.
 */
export type BuyToken = NativeBuyToken | ERC20BuyToken;

/**
 * Represents a native buy token
 * @property {ItemType} type - The type indicate this is a native token.
 * @property {BigNumber} amount - The amount of native token.
 */
type NativeBuyToken = {
  type: ItemType.NATIVE;
  amount: BigNumber;
};

/**
 * Represents a ERC20 buy token
 * @property {ItemType} type - The type indicate this is a ERC20 token.
 * @property {BigNumber} amount - The amount of native token.
 * @property {string} contractAddress - The contract address of the ERC20.
 */
type ERC20BuyToken = {
  type: ItemType.ERC20;
  amount: BigNumber;
  contractAddress: string;
};

import { Web3Provider } from '@ethersproject/providers';
import { ItemType, SmartCheckoutResult } from './smartCheckout';
import { OrderFee } from './fees';

/**
 * Interface representing the parameters for {@link Checkout.sell}
 * @property {Web3Provider} provider - The provider to use for the sell.
 * @property {Array<SellOrder>} orders - An array of sell orders to execute.
 * Only currently actions the first order in the array until we support batch processing.
 */
export interface SellParams {
  provider: Web3Provider;
  orders: Array<SellOrder>;
}
/**
 * Interface of the SellOrder to create a listing from, includes makerFees
 * @property {SellToken} sellToken - the token to be listed for sale
 * @property {BuyToken} buyToken - the token info of the price of the item
 * @property {OrderFee[]} makerFees - option array of makerFees to be applied to the listing
 */
export interface SellOrder {
  sellToken: SellToken;
  buyToken: BuyToken;
  makerFees?: Array<OrderFee>;
}

/**
 * Interface of the SellToken
 * @property {string} id - The ERC721 token id
 * @property {string} collectionAddress - The ERC721 contract address
 */
export interface SellToken {
  id: string,
  collectionAddress: string,
}

/**
 * Interface representing the result of the sell
 * @property {string} id - The ERC721 ID.
 * @property {string} collectionAddress - The contract address of the ERC721s collection.
 * @property {SmartCheckoutResult} smartCheckoutResult - The result of the smart checkout.
 * @property {SellStatus} status - The status of the sell, present when smart checkout balances are sufficient
 */
export type SellResult = {
  id: string,
  collectionAddress: string,
  smartCheckoutResult: SmartCheckoutResult,
  status?: SellStatus,
};

/**
 * Represents the status of the transaction for the Sell
 */
export type SellStatus = SellSuccessStatus | SellFailedStatus;

/**
 * Represents the status of a successful Sell
 * @property {string} type - The success sell status type.
 * @property {string} orderId - The order ID of the listing.
 */
export interface SellSuccessStatus {
  type: SellStatusType.SUCCESS;
  orderId: string;
}

/**
 * Represents the status of a failed Sell
 * @property {string} type - The failed sell status type.
 * @property {string} transactionHash - The transaction hash of the failed transaction.
 * @property {string} reason - The reason for the failed transaction.
 */
export interface SellFailedStatus {
  type: SellStatusType.FAILED;
  transactionHash: string;
  reason: string;
}

/**
 * A type representing the status of the transaction for the Sell
 * @enum {string}
 * @property {string} SUCCESS - All the transactions were successful.
 * @property {string} FAILED - At least one of the transactions failed.
 */
export enum SellStatusType {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

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
  amount: string;
};

/**
 * Represents a ERC20 buy token
 * @property {ItemType} type - The type indicate this is a ERC20 token.
 * @property {BigNumber} amount - The amount of native token.
 * @property {string} contractAddress - The contract address of the ERC20.
 */
type ERC20BuyToken = {
  type: ItemType.ERC20;
  amount: string;
  contractAddress: string;
};

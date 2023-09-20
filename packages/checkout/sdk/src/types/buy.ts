import { Web3Provider } from '@ethersproject/providers';
import { SmartCheckoutResult } from './smartCheckout';

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
 * @property {SmartCheckoutResult} smartCheckoutResult - The result of smart checkout.
 * @property {string} orderId - The order ID.
 * @property {BuyStatus} status - The status of the buy, present when smart checkout balances are sufficient
 * and the transactions were executed
 */
export type BuyResult = {
  smartCheckoutResult: SmartCheckoutResult,
  orderId: string;
  status?: BuyStatus;
};

/**
 * Represents the status of the transaction for the Buy
 */
export type BuyStatus = BuySuccessStatus | BuyFailedStatus;

/**
 * Represents the status of a successful Buy
 * @property {string} type - The success buy status type.
 */
export interface BuySuccessStatus {
  type: BuyStatusType.SUCCESS;
}

/**
 * Represents the status of a failed Buy
 * @property {string} type - The failed buy status type.
 * @property {string} transactionHash - The transaction hash of the failed transaction.
 * @property {string} reason - The reason for the failed transaction.
 */
export interface BuyFailedStatus {
  type: BuyStatusType.FAILED;
  transactionHash: string;
  reason: string;
}

/**
 * A type representing the status of the transaction for the Buy
 * @enum {string}
 * @property {string} SUCCESS - All the transactions were successful.
 * @property {string} FAILED - At least one of the transactions failed.
 */
export enum BuyStatusType {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

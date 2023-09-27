import { Web3Provider } from '@ethersproject/providers';

/**
 * Interface representing the parameters for {@link Checkout.cancel}
 * @property {Web3Provider} provider - The provider to use for the cancel.
 * @property {string[]} orderIds - The order IDs to cancel.
 */
export interface CancelParams {
  provider: Web3Provider;
  orderIds: string[];
}

/**
 * Interface representing the result of the cancel
 * @property {string} orderId - The order ID.
 * @property {CancelStatus} status - The status of the cancel.
 */
export interface CancelResponse {
  orderId: string;
  status: CancelStatus;
}

/**
 * Represents the status of the transaction for the Cancel
 */
export type CancelStatus = CancelSuccessStatus | CancelFailedStatus;

/**
 * Represents the status of a successful Cancel
 * @property {string} type - The success cancel status type.
 */
export interface CancelSuccessStatus {
  type: CancelStatusType.SUCCESS;
}

/**
 * Represents the status of a failed Cancel
 * @property {string} type - The failed cancel status type.
 * @property {string} transactionHash - The transaction hash of the failed transaction.
 * @property {string} reason - The reason for the failed transaction.
 */
export interface CancelFailedStatus {
  type: CancelStatusType.FAILED;
  transactionHash: string;
  reason: string;
}

/**
 * A type representing the status of the transaction for the Cancel
 * @enum {string}
 * @property {string} SUCCESS - All the transactions were successful.
 * @property {string} FAILED - At least one of the transactions failed.
 */
export enum CancelStatusType {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

import { Web3Provider } from '@ethersproject/providers';
import { EIP6963ProviderInfo } from '../../../types';

export enum PurchaseEventType {
  CLOSE_WIDGET = 'close-widget',
  CONNECT_SUCCESS = 'connect-success',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

/**
 * Represents a successful purchase.
 */
export type PurchaseSuccess = {};

/**
 * Type representing a purchase failure
 * @property {string} reason
 */
export type PurchaseFailed = {
  reason: string;
  timestamp: number;
};

/**
 * Type representing a successful provider connection
 * @property {Web3Provider} provider
 * @property {EIP6963ProviderInfo} providerInfo
 * @property {'from' | 'to'} providerType
 */
export type PurchaseConnectSuccess = {
  provider: Web3Provider;
  providerInfo: EIP6963ProviderInfo;
  providerType: 'from' | 'to';
};

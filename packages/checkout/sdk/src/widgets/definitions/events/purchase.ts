import { EIP6963ProviderInfo, WrappedBrowserProvider } from '../../../types';

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
 * @property {WrappedBrowserProvider} provider
 * @property {EIP6963ProviderInfo} providerInfo
 * @property {'from' | 'to'} providerType
 */
export type PurchaseConnectSuccess = {
  provider: WrappedBrowserProvider;
  providerInfo: EIP6963ProviderInfo;
  providerType: 'from' | 'to';
};

import { EIP6963ProviderInfo, WrappedBrowserProvider, WalletProviderName } from '../../../types';

/**
 * Enum representing possible Connect Widget event types.
 */
export enum ConnectEventType {
  CLOSE_WIDGET = 'close-widget',
  SUCCESS = 'success',
  FAILURE = 'failure',
  LANGUAGE_CHANGED = 'language-changed',
  WALLETCONNECT_PROVIDER_UPDATED = 'walletconnect-provider-updated',
}

/**
 * Represents a successful connection.
 * @property {WrappedBrowserProvider} provider
 * @property {WalletProviderName | undefined} walletProviderName
 */

export type ConnectionSuccess = {
  /** The connected provider. */
  provider: WrappedBrowserProvider;
  /** The wallet provider name of the connected provider. */
  walletProviderName: WalletProviderName | undefined;
  /** The wallet provider EIP-6963 metadata. */
  walletProviderInfo: EIP6963ProviderInfo | undefined;
};

/**
 * Represents a connection failure with a reason.
 * @property {string} reason
 */
export type ConnectionFailed = {
  /** The reason for the failed connection. */
  reason: string;
};

export type WalletConnectProviderChanged = {
  ethereumProvider: any; // EthereumProvider;
  walletConnectManager: WalletConnectManager;
};

/**
 * Provides access to the underlying WalletConnect modal and provider.
 */
export interface WalletConnectManager {
  isInitialised: () => boolean;
  isEnabled: () => boolean;
  getModal: () => any; // WalletConnectModal;
  getProvider: () => Promise<any>; // EthereumProvider>;
  loadWalletListings: () => Promise<Response | undefined>;
  getWalletLogoUrl: (walletSlug?: string) => Promise<string | undefined>;
}

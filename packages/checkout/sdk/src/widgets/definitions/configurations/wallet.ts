/* eslint-disable max-len */
import { WidgetConfiguration } from './widget';

/**
 * Wallet Widget Configuration represents the configuration options for the Wallet Widget.
 * @property {boolean | undefined} showDisconnectButton - show/hide the disconnect button in the Wallet Widget (defaults to true)
 * @property {boolean | undefined} showNetworkMenu - show/hide the network menu in the Wallet Widget (defaults to true)
 */
export type WalletWidgetConfiguration = {
  showDisconnectButton?: boolean;
  showNetworkMenu?: boolean;
} & WidgetConfiguration;

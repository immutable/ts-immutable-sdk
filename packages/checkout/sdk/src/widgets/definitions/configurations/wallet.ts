/* eslint-disable max-len */
import { WidgetConfiguration } from './widget';

/**
 * Wallet Widget Configuration represents the configuration options for the Wallet Widget.
 * @property {boolean | undefined} showDisconnectButton
 * @property {boolean | undefined} showNetworkMenu
 */
export type WalletWidgetConfiguration = {
  /** Show/hide the disconnect button in the Wallet Widget (defaults to true) */
  showDisconnectButton?: boolean;
  /** Show/hide the network menu in the Wallet Widget (defaults to true) */
  showNetworkMenu?: boolean;
} & WidgetConfiguration;

import { WidgetConfiguration } from './widget';

/**
 * Connect Widget Configuration represents the configuration options for the Connect Widget.
 */
export type ConnectWidgetConfiguration = {
  blocklistWalletRdns?: string[];
} & WidgetConfiguration;

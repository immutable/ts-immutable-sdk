/* eslint-disable max-len */
import { ConnectWidgetConfiguration } from './connect';
import { WalletWidgetConfiguration } from './wallet';
import { WidgetConfiguration } from './widget';

export type CheckoutWidgetConfiguration = {
  connect?: Omit<ConnectWidgetConfiguration, 'WidgetConfiguration'>;
  wallet?: Omit<WalletWidgetConfiguration, 'WidgetConfiguration'>;
} & WidgetConfiguration;

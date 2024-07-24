/* eslint-disable max-len */
import { ConnectWidgetConfiguration } from './connect';
import { WalletWidgetConfiguration } from './wallet';
import { BridgeWidgetConfiguration } from './bridge';
import { SwapWidgetConfiguration } from './swap';
import { OnrampWidgetConfiguration } from './onramp';
import { SaleWidgetConfiguration } from './sale';

import { WidgetConfiguration } from './widget';

export type CheckoutWidgetConfiguration = {
  connect?: Omit<ConnectWidgetConfiguration, 'WidgetConfiguration'>;
  wallet?: Omit<WalletWidgetConfiguration, 'WidgetConfiguration'>;
  swap?: Omit<SwapWidgetConfiguration, 'WidgetConfiguration'>;
  bridge?: Omit<BridgeWidgetConfiguration, 'WidgetConfiguration'>;
  onRamp?: Omit<OnrampWidgetConfiguration, 'WidgetConfiguration'>;
  sale?: Omit<SaleWidgetConfiguration, 'WidgetConfiguration'>;
} & WidgetConfiguration;

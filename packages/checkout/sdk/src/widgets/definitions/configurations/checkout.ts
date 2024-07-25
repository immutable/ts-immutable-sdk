/* eslint-disable max-len */
import { ConnectWidgetConfiguration } from './connect';
import { WalletWidgetConfiguration } from './wallet';
import { BridgeWidgetConfiguration } from './bridge';
import { SwapWidgetConfiguration } from './swap';
import { OnrampWidgetConfiguration } from './onramp';
import { SaleWidgetConfiguration } from './sale';

import { WidgetConfiguration } from './widget';

export type CheckoutWidgetConfiguration = {
  connect?: Omit<ConnectWidgetConfiguration, keyof WidgetConfiguration>;
  wallet?: Omit<WalletWidgetConfiguration, keyof WidgetConfiguration>;
  swap?: Omit<SwapWidgetConfiguration, keyof WidgetConfiguration>;
  bridge?: Omit<BridgeWidgetConfiguration, keyof WidgetConfiguration>;
  onRamp?: Omit<OnrampWidgetConfiguration, keyof WidgetConfiguration>;
  sale?: Omit<SaleWidgetConfiguration, keyof WidgetConfiguration>;
} & Omit<WidgetConfiguration, 'walletConnect'>;

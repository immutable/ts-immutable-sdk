/* eslint-disable max-len */
import { ConnectWidgetConfiguration } from './connect';
import { WalletWidgetConfiguration } from './wallet';
import { BridgeWidgetConfiguration } from './bridge';
import { SwapWidgetConfiguration } from './swap';
import { OnrampWidgetConfiguration } from './onramp';
import { SaleWidgetConfiguration } from './sale';
import { AddFundsWidgetConfiguration } from './addFunds';

import { WidgetConfiguration } from './widget';

export type CheckoutWidgetConfiguration = {
  CONNECT?: Omit<ConnectWidgetConfiguration, keyof WidgetConfiguration>;
  WALLET?: Omit<WalletWidgetConfiguration, keyof WidgetConfiguration>;
  SWAP?: Omit<SwapWidgetConfiguration, keyof WidgetConfiguration>;
  BRIDGE?: Omit<BridgeWidgetConfiguration, keyof WidgetConfiguration>;
  ONRAMP?: Omit<OnrampWidgetConfiguration, keyof WidgetConfiguration>;
  SALE?: Omit<SaleWidgetConfiguration, keyof WidgetConfiguration>;
  ADD_FUNDS?: Omit<AddFundsWidgetConfiguration, keyof WidgetConfiguration>;
} & Omit<WidgetConfiguration, 'walletConnect'>;

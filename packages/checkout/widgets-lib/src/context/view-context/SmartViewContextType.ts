import { ViewType } from './ViewType';

export enum SmartWidgetViews {
  SMART_CHECKOUT = 'SMART_CHECKOUT',
  SMART_WALLET = 'SMART_WALLET',
  SMART_BRIDGE = 'SMART_BRIDGE',
  SMART_SWAP = 'SMART_SWAP',
  SMART_ONRAMP = 'SMART_ONRAMP',
  SWITCH_NETWORK_ZKEVM = 'SWITCH_NETWORK_ZKEVM',
  SWITCH_NETWORK_ETH = 'SWITCH_NETWORK_ETH',
}

export type SmartWidgetView =
  | SmartCheckoutView
  | SmartWalletView
  | SmartCheckoutBridge
  | SmartCheckoutSwap
  | SmartCheckoutOnramp
  | SmartCheckoutSwitchZkevm
  | SmartCheckoutSwitchEth;

interface SmartCheckoutView extends ViewType {
  type: SmartWidgetViews.SMART_CHECKOUT;
  data?: any;
}

interface SmartWalletView extends ViewType {
  type: SmartWidgetViews.SMART_WALLET;
  data?: any;
}

interface SmartCheckoutBridge extends ViewType {
  type: SmartWidgetViews.SMART_BRIDGE;
  data?: any;
}

interface SmartCheckoutSwap extends ViewType {
  type: SmartWidgetViews.SMART_SWAP;
  data?: any;
}

interface SmartCheckoutSwitchZkevm extends ViewType {
  type: SmartWidgetViews.SWITCH_NETWORK_ZKEVM;
  data?: any;
}

interface SmartCheckoutSwitchEth extends ViewType {
  type: SmartWidgetViews.SWITCH_NETWORK_ETH;
  data?: any;
}

interface SmartCheckoutOnramp extends ViewType {
  type: SmartWidgetViews.SMART_ONRAMP;
  data?: any;
}

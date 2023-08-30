import { ViewType } from './ViewType';

export enum SmartWidgetViews {
  SMART_CHECKOUT = 'SMART_CHECKOUT',
  SMART_BRIDGE = 'SMART_BRIDGE',
  SMART_SWAP = 'SMART_SWAP',
  SMART_ONRAMP = 'SMART_ONRAMP',
}

export type SmartWidgetView =
  | SmartCheckoutView
  | SmartCheckoutBridge
  | SmartCheckoutSwap
  | SmartCheckoutOnramp;

interface SmartCheckoutView extends ViewType {
  type: SmartWidgetViews.SMART_CHECKOUT;
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

interface SmartCheckoutOnramp extends ViewType {
  type: SmartWidgetViews.SMART_ONRAMP;
  data?: any;
}

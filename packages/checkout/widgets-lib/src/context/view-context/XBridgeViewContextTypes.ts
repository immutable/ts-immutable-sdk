import { ViewType } from './ViewType';

export enum XBridgeWidgetViews {
  WALLET_NETWORK_SECLECTION = 'WALLET_NETWORK_SECLECTION',
  BRIDGE_FORM = 'BRIDGE_FORM',
  BRIDGE_REVIEW = 'BRIDGE_REVIEW',
}

export type XBridgeWidgetView =
  | XBridgeCrossWalletSelection
  | XBridgeForm
  | XBridgeReview;

interface XBridgeCrossWalletSelection extends ViewType {
  type: XBridgeWidgetViews.WALLET_NETWORK_SECLECTION,
  data?: {}
}

interface XBridgeForm extends ViewType {
  type: XBridgeWidgetViews.BRIDGE_FORM,
  data?: {}
}

interface XBridgeReview extends ViewType {
  type: XBridgeWidgetViews.BRIDGE_REVIEW,
  data?: {}
}

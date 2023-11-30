import { ViewType } from './ViewType';

export enum XBridgeWidgetViews {
  BRIDGE_WALLET_SELECTION = 'BRIDGE_WALLET_SELECTION',
  BRIDGE_FORM = 'BRIDGE_FORM',
  BRIDGE_REVIEW = 'BRIDGE_REVIEW',
}

export type XBridgeWidgetView =
  | XBridgeCrossWalletSelection
  | XBridgeForm
  | XBridgeReview;

interface XBridgeCrossWalletSelection extends ViewType {
  type: XBridgeWidgetViews.BRIDGE_WALLET_SELECTION,
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

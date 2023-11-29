import { ViewType } from './ViewType';

export enum XBridgeWidgetViews {
  BRIDGE_WALLET_SELECTION = 'BRIDGE_WALLET_SELECTION',
  BRIDGE_REVIEW = 'BRIDGE_REVIEW',
}

export type XBridgeWidgetView =
  | XBridgeCrossWalletSelection
  | XBridgeReview;

interface XBridgeCrossWalletSelection extends ViewType {
  type: XBridgeWidgetViews.BRIDGE_WALLET_SELECTION,
  data?: {}
}

interface XBridgeReview extends ViewType {
  type: XBridgeWidgetViews.BRIDGE_REVIEW,
  data?: {}
}

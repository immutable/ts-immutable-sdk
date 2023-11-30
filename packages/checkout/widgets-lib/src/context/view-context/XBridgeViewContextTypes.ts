import { ViewType } from './ViewType';

export enum XBridgeWidgetViews {
  BRIDGE_WALLET_SELECTION = 'BRIDGE_WALLET_SELECTION',
  BRIDGE_FORM = 'BRIDGE_FORM',
  BRIDGE_REVIEW = 'BRIDGE_REVIEW',
  APPROVE_TX = 'APPROVE_TX',
}

export type XBridgeWidgetView =
  | XBridgeCrossWalletSelection
  | XBridgeForm
  | XBridgeReview
  | XBridgeApproveTx;

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

interface XBridgeApproveTx extends ViewType {
  type: XBridgeWidgetViews.APPROVE_TX,
  data?: {}
}

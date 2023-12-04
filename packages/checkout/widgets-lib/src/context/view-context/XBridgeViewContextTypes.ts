import { ViewType } from './ViewType';

export enum XBridgeWidgetViews {
  WALLET_NETWORK_SECLECTION = 'WALLET_NETWORK_SECLECTION',
  BRIDGE_FORM = 'BRIDGE_FORM',
  BRIDGE_REVIEW = 'BRIDGE_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
}

export type XBridgeWidgetView =
  | XBridgeCrossWalletSelection
  | XBridgeForm
  | XBridgeReview
  | XBridgeInProgress;

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

interface XBridgeInProgress extends ViewType {
  type: XBridgeWidgetViews.IN_PROGRESS,
  data?: {}
}

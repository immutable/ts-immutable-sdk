import { ViewType } from './ViewType';

export enum XBridgeWidgetViews {
  WALLET_NETWORK_SELECTION = 'WALLET_NETWORK_SELECTION',
  BRIDGE_FORM = 'BRIDGE_FORM',
  BRIDGE_REVIEW = 'BRIDGE_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  BRIDGE_FAILURE = 'BRIDGE_FAILURE',
}

export type XBridgeWidgetView =
  | XBridgeCrossWalletSelection
  | XBridgeForm
  | XBridgeReview
  | XBridgeInProgress
  | XBridgeFailure;

interface XBridgeCrossWalletSelection extends ViewType {
  type: XBridgeWidgetViews.WALLET_NETWORK_SELECTION,
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

interface XBridgeFailure extends ViewType {
  type: XBridgeWidgetViews.BRIDGE_FAILURE,
  data?: {}
}

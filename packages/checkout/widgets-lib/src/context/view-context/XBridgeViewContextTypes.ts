import { ViewType } from './ViewType';

export enum XBridgeWidgetViews {
  CROSS_WALLET_SELECTION = 'CROSS_WALLET_SELECTION',
}

export type XBridgeWidgetView =
  | XBridgeCrossWalletSelection;

interface XBridgeCrossWalletSelection extends ViewType {
  type: XBridgeWidgetViews.CROSS_WALLET_SELECTION,
  data?: {}
}

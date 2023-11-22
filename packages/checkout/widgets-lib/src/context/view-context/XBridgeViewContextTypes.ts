import { ViewType } from './ViewType';

export enum XBridgeWidgetViews {
  BRIDGE_WALLET_SELECTION = 'BRIDGE_WALLET_SELECTION',
}

export type XBridgeWidgetView =
  | XBridgeCrossWalletSelection;

interface XBridgeCrossWalletSelection extends ViewType {
  type: XBridgeWidgetViews.BRIDGE_WALLET_SELECTION,
  data?: {}
}

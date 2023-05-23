export enum BridgeWidgetViews {
  BRIDGE = 'BRIDGE',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type BridgeWidgetView =
  | { type: BridgeWidgetViews.BRIDGE }
  | { type: BridgeWidgetViews.SUCCESS }
  | BridgeFailView;

interface BridgeFailView {
  type: BridgeWidgetViews.FAIL;
  reason: string;
}

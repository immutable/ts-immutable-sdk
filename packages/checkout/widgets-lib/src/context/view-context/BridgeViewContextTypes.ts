import { TokenInfo } from '@imtbl/checkout-sdk';

export enum BridgeWidgetViews {
  BRIDGE = 'BRIDGE',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type BridgeWidgetView =
  | { type: BridgeWidgetViews.BRIDGE }
  | BridgeInProgressView
  | { type: BridgeWidgetViews.SUCCESS }
  | BridgeFailView;

interface BridgeFailView {
  type: BridgeWidgetViews.FAIL;
  reason: string;
}

interface BridgeInProgressView {
  type: BridgeWidgetViews.IN_PROGRESS;
  data: { token: TokenInfo };
}

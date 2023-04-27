export enum ConnectWidgetViews {
  CONNECT_WALLET = 'CONNECT_WALLET',
  READY_TO_CONNECT = 'READY_TO_CONNECT',
  PASSPORT = 'PASSPORT',
  CHOOSE_NETWORKS = 'CHOOSE_NETWORKS',
  SWITCH_NETWORK = 'SWITCH_NETWORK',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type ConnectWidgetView =
  | { type: ConnectWidgetViews.CONNECT_WALLET }
  | { type: ConnectWidgetViews.READY_TO_CONNECT }
  | { type: ConnectWidgetViews.CHOOSE_NETWORKS }
  | { type: ConnectWidgetViews.SWITCH_NETWORK }
  | { type: ConnectWidgetViews.PASSPORT }
  | { type: ConnectWidgetViews.SUCCESS }
  | ConnectFailureView;

interface ConnectFailureView {
  type: ConnectWidgetViews.FAIL;
  error: Error;
}

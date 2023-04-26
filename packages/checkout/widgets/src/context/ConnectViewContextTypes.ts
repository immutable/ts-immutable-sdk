export enum ConnectWidgetViews {
  CONNECT_WALLET = 'CONNECT_WALLET',
  PASSPORT = 'PASSPORT',
  OTHER_WALLETS = 'OTHER_WALLETS',
  CHOOSE_NETWORKS = 'CHOOSE_NETWORKS',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type ConnectWidgetView =
  | { type: ConnectWidgetViews.CONNECT_WALLET }
  | { type: ConnectWidgetViews.CHOOSE_NETWORKS }
  | { type: ConnectWidgetViews.OTHER_WALLETS }
  | { type: ConnectWidgetViews.PASSPORT }
  | { type: ConnectWidgetViews.SUCCESS }
  | ConnectFailureView;

interface ConnectFailureView {
  type: ConnectWidgetViews.FAIL;
  error: Error;
}

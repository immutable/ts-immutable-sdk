export enum WalletWidgetViews {
  WALLET_BALANCES = 'WALLET_BALANCES',
  SETTINGS = 'SETTINGS',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type WalletWidgetView =
  | { type: WalletWidgetViews.WALLET_BALANCES }
  | { type: WalletWidgetViews.SETTINGS }
  | { type: WalletWidgetViews.SUCCESS }
  | WalletFailView;

interface WalletFailView {
  type: WalletWidgetViews.FAIL;
  reason: string;
}

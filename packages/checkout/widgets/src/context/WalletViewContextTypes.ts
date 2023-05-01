export enum WalletWidgetViews {
  WALLET_BALANCES = 'WALLET_BALANCES',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type WalletWidgetView =
  | { type: WalletWidgetViews.WALLET_BALANCES }
  | { type: WalletWidgetViews.SUCCESS }
  | WalletFailureView;

interface WalletFailureView {
  type: WalletWidgetViews.FAIL;
  error: Error;
}

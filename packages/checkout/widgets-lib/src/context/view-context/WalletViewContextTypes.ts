export enum WalletWidgetViews {
  WALLET_BALANCES = 'WALLET_BALANCES',
  SETTINGS = 'SETTINGS',
  COIN_INFO = 'COIN_INFO',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type WalletWidgetView =
  | { type: WalletWidgetViews.WALLET_BALANCES }
  | { type: WalletWidgetViews.SETTINGS }
  | { type: WalletWidgetViews.COIN_INFO }
  | { type: WalletWidgetViews.SUCCESS }
  | WalletFailView;

interface WalletFailView {
  type: WalletWidgetViews.FAIL;
  reason: string;
}

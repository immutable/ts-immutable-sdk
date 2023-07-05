import { ViewType } from './ViewType';

export enum WalletWidgetViews {
  WALLET_BALANCES = 'WALLET_BALANCES',
  SETTINGS = 'SETTINGS',
  COIN_INFO = 'COIN_INFO',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type WalletWidgetView =
  | WalletBalancesView
  | WalletSettingsView
  | WalletCoinInfoView
  | WalletSuccessView
  | WalletFailView;

interface WalletFailView extends ViewType {
  type: WalletWidgetViews.FAIL;
  reason: string;
}

interface WalletBalancesView extends ViewType { type: WalletWidgetViews.WALLET_BALANCES }
interface WalletSettingsView extends ViewType { type: WalletWidgetViews.SETTINGS }
interface WalletCoinInfoView extends ViewType { type: WalletWidgetViews.COIN_INFO }
interface WalletSuccessView extends ViewType { type: WalletWidgetViews.SUCCESS }

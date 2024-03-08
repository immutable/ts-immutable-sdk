import { ViewType } from './ViewType';

export enum ConnectWidgetViews {
  CONNECT_WALLET = 'CONNECT_WALLET',
  PASSPORT = 'PASSPORT',
  SWITCH_NETWORK = 'SWITCH_NETWORK',
  SUCCESS = 'SUCCESS',
}

export type ConnectWidgetView =
  | ConnectWalletView
  | SwitchNetworkView
  | ConnectSuccessView;

interface ConnectWalletView extends ViewType { type: ConnectWidgetViews.CONNECT_WALLET }
interface SwitchNetworkView extends ViewType { type: ConnectWidgetViews.SWITCH_NETWORK }
interface ConnectSuccessView extends ViewType { type: ConnectWidgetViews.SUCCESS }

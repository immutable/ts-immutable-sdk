import { ViewType } from './ViewType';

export enum ConnectWidgetViews {
  CONNECT_WALLET = 'CONNECT_WALLET',
  READY_TO_CONNECT = 'READY_TO_CONNECT',
  PASSPORT = 'PASSPORT',
  SWITCH_NETWORK = 'SWITCH_NETWORK',
  SUCCESS = 'SUCCESS',
}

export type ConnectWidgetView =
  | ConnectWalletView
  | ReadyToConnectView
  | SwitchNetworkView
  | ConnectSuccessView;

interface ConnectWalletView extends ViewType { type: ConnectWidgetViews.CONNECT_WALLET }
interface ReadyToConnectView extends ViewType { type: ConnectWidgetViews.READY_TO_CONNECT }
interface SwitchNetworkView extends ViewType { type: ConnectWidgetViews.SWITCH_NETWORK }
interface ConnectSuccessView extends ViewType { type: ConnectWidgetViews.SUCCESS }

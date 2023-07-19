import { ViewType } from './ViewType';

export enum ConnectWidgetViews {
  CONNECT_WALLET = 'CONNECT_WALLET',
  READY_TO_CONNECT = 'READY_TO_CONNECT',
  PASSPORT = 'PASSPORT',
  SUCCESS = 'SUCCESS',
}

export type ConnectWidgetView =
  | ConnectWalletView
  | ReadyToConnectView
  | ConnectSuccessView;

interface ConnectWalletView extends ViewType { type: ConnectWidgetViews.CONNECT_WALLET }
interface ReadyToConnectView extends ViewType { type: ConnectWidgetViews.READY_TO_CONNECT }
interface ConnectSuccessView extends ViewType { type: ConnectWidgetViews.SUCCESS }

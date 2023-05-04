import { createContext } from 'react';

export interface WidgetState {
  showConnectWidget: boolean;
  showWalletWidget: boolean;
  showSwapWidget: boolean;
  showBridgeWidget: boolean;
}

export const initialWidgetState: WidgetState = {
  showConnectWidget: false,
  showWalletWidget: false,
  showSwapWidget: false,
  showBridgeWidget: false,
};

export interface WidgetContextState {
  widgetState: WidgetState;
  widgetDispatch: React.Dispatch<WidgetAction>;
}

export interface WidgetAction {
  payload: WidgetActionPayload;
}

type WidgetActionPayload =
  | ShowConnectWidgetPayload
  | ShowWalletWidgetPayload
  | ShowSwapWidgetPayload
  | ShowBridgeWidgetPayload
  | CloseWidgetPayload;

export enum WidgetActions {
  SHOW_CONNECT_WIDGET = 'SHOW_CONNECT_WIDGET',
  SHOW_WALLET_WIDGET = 'SHOW_WALLET_WIDGET',
  SHOW_SWAP_WIDGET = 'SHOW_SWAP_WIDGET',
  SHOW_BRIDGE_WIDGET = 'SHOW_BRIDGE_WIDGET',
  CLOSE_WIDGET = 'CLOSE_WIDGET',
}

export interface ShowConnectWidgetPayload {
  type: WidgetActions.SHOW_CONNECT_WIDGET;
  connectWidgetInputs: any;
}

export interface ShowWalletWidgetPayload {
  type: WidgetActions.SHOW_WALLET_WIDGET;
  walletWidgetInputs: any;
}

export interface ShowSwapWidgetPayload {
  type: WidgetActions.SHOW_SWAP_WIDGET;
  swapWidgetInputs: any;
}

export interface ShowBridgeWidgetPayload {
  type: WidgetActions.SHOW_BRIDGE_WIDGET;
  bridgeWidgetInputs: any;
}

export interface CloseWidgetPayload {
  type: WidgetActions.CLOSE_WIDGET;
}

export const WidgetContext = createContext<WidgetContextState>({
  widgetState: initialWidgetState,
  widgetDispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const widgetReducer: Reducer<WidgetState, WidgetAction> = (
  state: WidgetState,
  action: WidgetAction
) => {
  switch (action.payload.type) {
    case WidgetActions.SHOW_CONNECT_WIDGET:
      return {
        showConnectWidget: true,
        showWalletWidget: false,
        showSwapWidget: false,
        showBridgeWidget: false,
      };
    case WidgetActions.SHOW_WALLET_WIDGET:
      return {
        showConnectWidget: false,
        showWalletWidget: true,
        showSwapWidget: false,
        showBridgeWidget: false,
      };
    case WidgetActions.SHOW_SWAP_WIDGET:
      return {
        showConnectWidget: false,
        showWalletWidget: false,
        showSwapWidget: true,
        showBridgeWidget: false,
      };
    case WidgetActions.SHOW_BRIDGE_WIDGET:
      return {
        showConnectWidget: false,
        showWalletWidget: false,
        showSwapWidget: false,
        showBridgeWidget: true,
      };
    case WidgetActions.CLOSE_WIDGET:
      return {
        showConnectWidget: false,
        showWalletWidget: false,
        showSwapWidget: false,
        showBridgeWidget: false,
      };
    default:
      return state;
  }
};

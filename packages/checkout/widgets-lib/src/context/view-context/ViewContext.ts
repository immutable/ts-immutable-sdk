import { createContext } from 'react';
import { ConnectWidgetView } from './ConnectViewContextTypes';
import { WalletWidgetView } from './WalletViewContextTypes';
import { PrefilledSwapForm, SwapWidgetView } from './SwapViewContextTypes';
import { BridgeWidgetView, PrefilledBridgeForm } from './BridgeViewContextTypes';
import { ViewType } from './ViewType';

export enum SharedViews {
  LOADING_VIEW = 'LOADING_VIEW',
  ERROR_VIEW = 'ERROR_VIEW',
  TOP_UP_VIEW = 'TOP_UP_VIEW',
}

export type SharedView =
LoadingView
| ErrorView
| TopUpView;

interface LoadingView extends ViewType {
  type: SharedViews.LOADING_VIEW
}

interface ErrorView extends ViewType {
  type: SharedViews.ERROR_VIEW;
  error: Error;
}

interface TopUpView extends ViewType {
  type: SharedViews.TOP_UP_VIEW,
  swapData?: PrefilledSwapForm,
  bridgeData?: PrefilledBridgeForm,
}

export type View =
  SharedView
  | ConnectWidgetView
  | WalletWidgetView
  | SwapWidgetView
  | BridgeWidgetView;

export interface ViewState {
  view: View;
  history: View[];
}

export const initialViewState: ViewState = {
  view: {
    type: SharedViews.LOADING_VIEW,
  },
  history: [],
};

export interface ViewContextState {
  viewState: ViewState;
  viewDispatch: React.Dispatch<ViewAction>;
}

export interface ViewAction {
  payload: ViewActionPayload;
}

type ViewActionPayload = UpdateViewPayload | GoBackPayload;

export enum ViewActions {
  UPDATE_VIEW = 'UPDATE_VIEW',
  GO_BACK = 'GO_BACK',
}

export interface UpdateViewPayload {
  type: ViewActions.UPDATE_VIEW;
  view: View;
  currentViewData?: any;
}

export interface GoBackPayload {
  type: ViewActions.GO_BACK;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ViewContext = createContext<ViewContextState>({
  viewState: initialViewState,
  viewDispatch: () => {},
});

ViewContext.displayName = 'ViewContext'; // help with debugging Context in browser

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const viewReducer: Reducer<ViewState, ViewAction> = (
  state: ViewState,
  action: ViewAction,
) => {
  // TODO consider using if statements instead of switch
  switch (action.payload.type) {
    case ViewActions.UPDATE_VIEW:
      // eslint-disable-next-line no-case-declarations
      const { view, currentViewData } = action.payload;
      // eslint-disable-next-line no-case-declarations
      const { history } = state;
      if (
        history.length === 0
        || history[history.length - 1].type !== view.type
      ) {
        console.log('current view data should be set before updating', currentViewData);

        // currentViewData should only be set on the current view before updating
        if (currentViewData) {
          history[history.length - 1] = { ...history[history.length - 1], data: currentViewData };
        }

        history.push(view);
      }

      return {
        ...state,
        view,
        history,
      };
    case ViewActions.GO_BACK:
      if (state.history.length <= 1) return { ...state };
      // eslint-disable-next-line no-case-declarations
      const updatedHistory = state.history.slice(0, -1);
      return {
        ...state,
        history: updatedHistory,
        view: updatedHistory[updatedHistory.length - 1],
      };
    default:
      return state;
  }
};

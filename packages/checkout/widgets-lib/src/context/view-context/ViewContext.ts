import { createContext } from 'react';
import { ConnectWidgetView } from './ConnectViewContextTypes';
import { WalletWidgetView } from './WalletViewContextTypes';
import { PrefilledSwapForm, SwapWidgetView } from './SwapViewContextTypes';
import { BridgeWidgetView } from './BridgeViewContextTypes';
import { SaleWidgetView } from './SaleViewContextTypes';
import { ViewType } from './ViewType';
import { OnRampWidgetView } from './OnRampViewContextTypes';
import { AddFundsWidgetView } from './AddFundsViewContextTypes';

export enum SharedViews {
  LOADING_VIEW = 'LOADING_VIEW',
  ERROR_VIEW = 'ERROR_VIEW',
  SERVICE_UNAVAILABLE_ERROR_VIEW = 'SERVICE_UNAVAILABLE_ERROR_VIEW',
  TOP_UP_VIEW = 'TOP_UP_VIEW',
}

export type SharedView =
  LoadingView
  | ErrorView
  | ServiceUnavailableErrorView
  | TopUpView;

interface LoadingView extends ViewType {
  type: SharedViews.LOADING_VIEW
}

export interface ErrorView extends ViewType {
  type: SharedViews.ERROR_VIEW;
  error: Error;
  tryAgain?: () => Promise<any>
}

interface ServiceUnavailableErrorView extends ViewType {
  type: SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW;
  error: Error;
}

interface TopUpView extends ViewType {
  type: SharedViews.TOP_UP_VIEW,
  swapData?: PrefilledSwapForm,
}

export type View =
  SharedView
  | ConnectWidgetView
  | WalletWidgetView
  | SwapWidgetView
  | OnRampWidgetView
  | SaleWidgetView
  | BridgeWidgetView
  | AddFundsWidgetView;

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

type ViewActionPayload = UpdateViewPayload | GoBackPayload | GoBackToPayload;

export enum ViewActions {
  UPDATE_VIEW = 'UPDATE_VIEW',
  GO_BACK = 'GO_BACK',
  GO_BACK_TO = 'GO_BACK_TO',
}

export interface UpdateViewPayload {
  type: ViewActions.UPDATE_VIEW;
  view: View;
  currentViewData?: any;
}

export interface GoBackPayload {
  type: ViewActions.GO_BACK;
}

export interface GoBackToPayload {
  type: ViewActions.GO_BACK_TO;
  view: View;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ViewContext = createContext<ViewContextState>({
  viewState: initialViewState,
  viewDispatch: () => { },
});

ViewContext.displayName = 'ViewContext'; // help with debugging Context in browser

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const viewReducer: Reducer<ViewState, ViewAction> = (
  state: ViewState,
  action: ViewAction,
) => {
  // TODO consider using if statements instead of switch
  switch (action.payload.type) {
    case ViewActions.UPDATE_VIEW: {
      const { view, currentViewData } = action.payload;
      if (view.type === SharedViews.ERROR_VIEW) {
        // eslint-disable-next-line no-console
        console.error((view as ErrorView).error);
      }
      const { history } = state;
      if (
        history.length === 0
        || history[history.length - 1].type !== view.type
      ) {
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
    }
    case ViewActions.GO_BACK: {
      if (state.history.length <= 1) return { ...state };
      const updatedHistory = state.history.slice(0, -1);
      return {
        ...state,
        history: updatedHistory,
        view: updatedHistory[updatedHistory.length - 1],
      };
    }
    case ViewActions.GO_BACK_TO: {
      if (state.history.length <= 1) return { ...state };
      /**
       * loop through the history backwards until we find the view
       * that we want to go back to. Set the updated history and the current view in state
       */
      const { history } = state;
      const updatedHistory = [...history]; // make a copy
      let matchFound = false;
      for (let i = history.length - 1; i >= 0; i--) {
        if (state.history[i].type === action.payload.view.type) {
          matchFound = true;
          break;
        }
        updatedHistory.pop();
      }

      if (!matchFound) {
        return { ...state };
      }

      return {
        ...state,
        history: updatedHistory,
        view: updatedHistory[updatedHistory.length - 1],
      };
    }

    default:
      return state;
  }
};

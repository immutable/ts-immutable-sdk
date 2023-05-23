import { createContext } from 'react';
import { ConnectWidgetView } from './ConnectViewContextTypes';
import { TransitionExampleWidgetView } from './TransitionExampleViewContextTypes';
import { InnerExampleWidgetView } from './InnerExampleViewContextTypes';
import { OuterExampleWidgetView } from './OuterExampleViewContextTypes';
import { WalletWidgetView } from './WalletViewContextTypes';
import { SwapWidgetView } from './SwapViewContextTypes';
import { BridgeWidgetView } from './BridgeViewContextTypes';

export enum BaseViews {
  LOADING_VIEW = 'LOADING_VIEW',
  ERROR = 'ERROR',
}

export type BaseView = { type: BaseViews.LOADING_VIEW } | ErrorView;

interface ErrorView {
  type: BaseViews.ERROR;
  error: Error;
}

export type View =
  | BaseView
  | ConnectWidgetView
  | WalletWidgetView
  | SwapWidgetView
  | BridgeWidgetView
  | TransitionExampleWidgetView
  | InnerExampleWidgetView
  | OuterExampleWidgetView;

export interface ViewState {
  view: View;
  history: View[];
}

export const initialViewState: ViewState = {
  view: {
    type: BaseViews.LOADING_VIEW,
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
      // eslint-disable-next-line no-case-declarations, prefer-destructuring
      const view = action.payload.view;
      // eslint-disable-next-line no-case-declarations, prefer-destructuring
      const history = state.history;
      if (
        history.length === 0
        || history[history.length - 1].type !== view.type
      ) {
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

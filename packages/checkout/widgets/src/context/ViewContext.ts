import { createContext } from 'react';
import { ConnectWidgetView } from './ConnectViewContextTypes';
import { TransitionExampleWidgetView } from './TransitionExampleViewContextTypes';

export enum BaseViews {
  LOADING_VIEW = 'LOADING_VIEW',
}

export type BaseView = { type: BaseViews.LOADING_VIEW };

export type View = BaseView | ConnectWidgetView | TransitionExampleWidgetView;

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

export const ViewContext = createContext<ViewContextState>({
  viewState: initialViewState,
  viewDispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const viewReducer: Reducer<ViewState, ViewAction> = (
  state: ViewState,
  action: ViewAction
) => {
  switch (action.payload.type) {
    case ViewActions.UPDATE_VIEW:
      const view = action.payload.view;
      const history = state.history;
      if (
        history.length === 0 ||
        history[history.length - 1].type !== view.type
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

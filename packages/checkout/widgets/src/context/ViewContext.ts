import { createContext } from 'react';
import { ConnectWidgetView } from './ConnectViewContextTypes';

export enum BaseViews {
  LOADING_VIEW = 'LOADING_VIEW',
}

export type BaseView = { type: BaseViews.LOADING_VIEW }

export type View = BaseView | ConnectWidgetView;

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
  viewDispatch: React.Dispatch<Action>;
}

export interface Action {
  payload: ActionPayload;
}

type ActionPayload = UpdateViewPayload | GoBackPayload;

export enum ViewActions {
  UPDATE_VIEW = 'UPDATE_VIEW',
  GO_BACK = 'GO_BACK'
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

export const viewReducer: Reducer<ViewState, Action> = (
  state: ViewState,
  action: Action
) => {
  switch (action.payload.type) {
    case ViewActions.UPDATE_VIEW:
      const view = action.payload.view;
      const history = state.history.slice();
      if (history[history.length - 1] !== view) {
        history.push(view);
      }
      return {
        ...state,
        view,
        history
      };
    case ViewActions.GO_BACK:
      const updatedHistory = state.history.slice(0, -1);
      return {
        ...state,
        history: updatedHistory,
        view: updatedHistory[updatedHistory.length - 1]
      }
    default:
      return state;
  }
};

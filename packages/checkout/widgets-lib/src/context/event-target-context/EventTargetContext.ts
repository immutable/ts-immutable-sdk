import { createContext, useReducer } from 'react';

export interface EventTargetState {
  eventTarget: Window | EventTarget
}

export const initialEventTargetState: EventTargetState = {
  eventTarget: window,
};

export interface EventTargetContextState {
  eventTargetState: EventTargetState;
  eventTargetDispatch: React.Dispatch<EventTargetAction>;
}

export interface EventTargetAction {
  payload: EventTargetActionPayload;
}

type EventTargetActionPayload = SetEventTargetPayload;

export enum EventTargetActions {
  SET_EVENT_TARGET = 'SET_EVENT_TARGET',
}

export interface SetEventTargetPayload {
  type: EventTargetActions.SET_EVENT_TARGET;
  eventTarget: Window | EventTarget;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EventTargetContext = createContext<EventTargetContextState>({
  eventTargetState: initialEventTargetState,
  eventTargetDispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const eventTargetReducer: Reducer<
EventTargetState,
EventTargetAction
> = (state: EventTargetState, action: EventTargetAction) => {
  switch (action.payload.type) {
    case EventTargetActions.SET_EVENT_TARGET:
      return {
        ...state,
        eventTarget: action.payload.eventTarget,
      };
    default:
      return state;
  }
};

export const useEventTargetState = () => {
  const [eventTargetState, eventTargetDispatch] = useReducer(eventTargetReducer, initialEventTargetState);

  return [eventTargetState, eventTargetDispatch] as const;
};

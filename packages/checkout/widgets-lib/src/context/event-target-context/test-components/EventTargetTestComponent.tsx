import React, { useMemo, useReducer } from 'react';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import {
  EventTargetState,
  initialEventTargetState,
  eventTargetReducer,
  EventTargetContext,
} from '../EventTargetContext';

export interface TestProps {
  children: React.ReactNode;
  initialStateOverride?: EventTargetState;
}

export function EventTargetTestComponent({ children, initialStateOverride }: TestProps) {
  const [eventTargetState, eventTargetDispatch] = useReducer(
    eventTargetReducer,
    initialStateOverride ?? initialEventTargetState,
  );

  const reducerValues = useMemo(
    () => ({ eventTargetState, eventTargetDispatch }),
    [eventTargetState, eventTargetDispatch],
  );

  return (
    <ViewContextTestComponent>
      <EventTargetContext.Provider value={reducerValues}>
        {children}
      </EventTargetContext.Provider>
    </ViewContextTestComponent>
  );
}

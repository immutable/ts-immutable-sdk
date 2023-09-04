import { BiomeCombinedProviders } from '@biom3/react';
import React, { useMemo, useReducer } from 'react';
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
    <BiomeCombinedProviders>
      <EventTargetContext.Provider value={reducerValues}>
        {children}
      </EventTargetContext.Provider>
    </BiomeCombinedProviders>
  );
}

import React, { useMemo, useReducer } from 'react';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import {
  ConnectLoaderState,
  initialConnectLoaderState,
  connectLoaderReducer,
  ConnectLoaderContext,
} from '../ConnectLoaderContext';

export interface TestProps {
  children: React.ReactNode;
  initialStateOverride?: ConnectLoaderState;
}

export function ConnectLoaderTestComponent({ children, initialStateOverride }: TestProps) {
  const [connectLoaderState, connectLoaderDispatch] = useReducer(
    connectLoaderReducer,
    initialStateOverride ?? initialConnectLoaderState,
  );

  const reducerValues = useMemo(
    () => ({ connectLoaderState, connectLoaderDispatch }),
    [connectLoaderState, connectLoaderDispatch],
  );

  return (
    <ViewContextTestComponent>
      <ConnectLoaderContext.Provider value={reducerValues}>
        {children}
      </ConnectLoaderContext.Provider>
    </ViewContextTestComponent>
  );
}

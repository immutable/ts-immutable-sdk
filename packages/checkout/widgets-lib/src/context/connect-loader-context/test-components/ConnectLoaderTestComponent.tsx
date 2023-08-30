import { BiomeCombinedProviders } from '@biom3/react';
import React, { useMemo, useReducer } from 'react';
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
    <BiomeCombinedProviders>
      <ConnectLoaderContext.Provider value={reducerValues}>
        {children}
      </ConnectLoaderContext.Provider>
    </BiomeCombinedProviders>
  );
}

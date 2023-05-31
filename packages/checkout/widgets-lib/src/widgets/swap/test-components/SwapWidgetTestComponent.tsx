import { BiomeCombinedProviders } from '@biom3/react';
import React, { useMemo, useReducer } from 'react';
import {
  initialSwapState, SwapContext, swapReducer, SwapState,
} from '../context/SwapContext';

export interface TestProps {
  children: React.ReactNode;
  initialStateOverride?: SwapState;
}

export function SwapWidgetTestComponent({ children, initialStateOverride }: TestProps) {
  const [swapState, swapDispatch] = useReducer(swapReducer, initialStateOverride ?? initialSwapState);

  const swapReducerValues = useMemo(
    () => ({ swapState, swapDispatch }),
    [swapState, swapDispatch],
  );

  return (
    <BiomeCombinedProviders>
      <SwapContext.Provider value={swapReducerValues}>
        {children}
      </SwapContext.Provider>
    </BiomeCombinedProviders>
  );
}

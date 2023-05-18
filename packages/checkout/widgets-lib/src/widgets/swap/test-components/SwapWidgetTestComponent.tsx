import { BiomeCombinedProviders } from '@biom3/react';
import React, { useMemo, useReducer } from 'react';
import {
  initialSwapState, SwapContext, swapReducer, SwapState,
} from '../context/swap-context/SwapContext';
import {
  initialSwapFormState,
  SwapFormContext,
  swapFormReducer,
  SwapFormState,
} from '../context/swap-form-context/SwapFormContext';

export interface TestProps {
  children: React.ReactNode;
  initialStateOverride?: SwapState;
  initialFormStateOverride?: SwapFormState;
}

export function SwapWidgetTestComponent({ children, initialStateOverride, initialFormStateOverride }: TestProps) {
  const [swapState, swapDispatch] = useReducer(swapReducer, initialStateOverride ?? initialSwapState);

  const swapReducerValues = useMemo(
    () => ({ swapState, swapDispatch }),
    [swapState, swapDispatch],
  );

  const [swapFormState, swapFormDispatch] = useReducer(
    swapFormReducer,
    initialFormStateOverride ?? initialSwapFormState,
  );

  const swapFormReducerValues = useMemo(
    () => ({ swapFormState, swapFormDispatch }),
    [swapFormState, swapFormDispatch],
  );

  return (
    <BiomeCombinedProviders>
      <SwapContext.Provider value={swapReducerValues}>
        <SwapFormContext.Provider value={swapFormReducerValues}>
          {children}
        </SwapFormContext.Provider>
      </SwapContext.Provider>
    </BiomeCombinedProviders>
  );
}

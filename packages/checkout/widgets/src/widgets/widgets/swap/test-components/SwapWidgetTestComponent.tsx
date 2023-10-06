import { BiomeCombinedProviders } from '@biom3/react';
import React, { useCallback, useMemo, useReducer } from 'react';
import {
  initialSwapState, SwapContext, swapReducer, SwapState,
} from '../context/SwapContext';
import {
  CryptoFiatContext, CryptoFiatContextState, CryptoFiatState, FiatSymbols,
} from '../../../context/crypto-fiat-context/CryptoFiatContext';

export interface TestProps {
  children: React.ReactNode;
  initialStateOverride?: SwapState;
  cryptoConversionsOverride?: Map<string, number>;
}

export function SwapWidgetTestComponent({ children, initialStateOverride, cryptoConversionsOverride }: TestProps) {
  const [swapState, swapDispatch] = useReducer(swapReducer, initialStateOverride ?? initialSwapState);

  const swapReducerValues = useMemo(
    () => ({ swapState, swapDispatch }),
    [swapState, swapDispatch],
  );

  const cryptoFiatState = useMemo(() => ({
    cryptoFiat: null,
    fiatSymbol: FiatSymbols.USD,
    tokenSymbols: [],
    conversions: cryptoConversionsOverride,
  } as CryptoFiatState), [cryptoConversionsOverride]);

  const cryptoFiatDispatch = useCallback(() => {}, []);

  const cryptoFiatReducerValues = useMemo(() => (
    { cryptoFiatState, cryptoFiatDispatch }
  ), [cryptoFiatState, cryptoFiatDispatch]);

  return (
    <BiomeCombinedProviders>
      <SwapContext.Provider value={swapReducerValues}>
        <CryptoFiatContext.Provider value={cryptoFiatReducerValues as CryptoFiatContextState}>
          {children}
        </CryptoFiatContext.Provider>
      </SwapContext.Provider>
    </BiomeCombinedProviders>
  );
}

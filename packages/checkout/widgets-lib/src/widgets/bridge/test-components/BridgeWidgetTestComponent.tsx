import React, { useCallback, useMemo, useReducer } from 'react';
import { Checkout } from '@imtbl/checkout-sdk';
import { ViewContextTestComponent } from '../../../context/view-context/test-components/ViewContextTestComponent';
import {
  initialBridgeState,
  BridgeContext,
  BridgeState,
  bridgeReducer,
} from '../context/BridgeContext';
import {
  CryptoFiatContext, CryptoFiatContextState, CryptoFiatState, FiatSymbols,
} from '../../../context/crypto-fiat-context/CryptoFiatContext';

export interface TestProps {
  children: React.ReactNode;
  initialStateOverride?: BridgeState;
  cryptoConversionsOverride?: Map<string, number>;
}

export function BridgeWidgetTestComponent({ children, initialStateOverride, cryptoConversionsOverride }: TestProps) {
  const [bridgeState, bridgeDispatch] = useReducer(
    bridgeReducer,
    initialStateOverride
      ? { ...initialStateOverride, checkout: {} as Checkout }
      : { ...initialBridgeState, checkout: {} as Checkout },
  );

  const bridgeReducerValues = useMemo(
    () => ({ bridgeState, bridgeDispatch }),
    [bridgeState, bridgeDispatch],
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
    <ViewContextTestComponent>
      <BridgeContext.Provider value={bridgeReducerValues}>
        <CryptoFiatContext.Provider value={cryptoFiatReducerValues as CryptoFiatContextState}>
          {children}
        </CryptoFiatContext.Provider>
      </BridgeContext.Provider>
    </ViewContextTestComponent>
  );
}

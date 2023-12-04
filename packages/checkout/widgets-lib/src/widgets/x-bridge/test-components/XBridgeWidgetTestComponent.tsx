import { BiomeCombinedProviders } from '@biom3/react';
import React, { useCallback, useMemo, useReducer } from 'react';
import { onLightBase } from '@biom3/design-tokens';
import { Checkout } from '@imtbl/checkout-sdk';
import {
  initialXBridgeState,
  XBridgeContext,
  XBridgeState,
  xBridgeReducer,
} from '../context/XBridgeContext';
import {
  CryptoFiatContext, CryptoFiatContextState, CryptoFiatState, FiatSymbols,
} from '../../../context/crypto-fiat-context/CryptoFiatContext';

export interface TestProps {
  children: React.ReactNode;
  initialStateOverride?: XBridgeState;
  cryptoConversionsOverride?: Map<string, number>;
}

export function XBridgeWidgetTestComponent({ children, initialStateOverride, cryptoConversionsOverride }: TestProps) {
  const [bridgeState, bridgeDispatch] = useReducer(
    xBridgeReducer,
    initialStateOverride
      ? { ...initialStateOverride, checkout: {} as Checkout }
      : { ...initialXBridgeState, checkout: {} as Checkout },
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
    <BiomeCombinedProviders theme={{ base: onLightBase }}>
      <XBridgeContext.Provider value={bridgeReducerValues}>
        <CryptoFiatContext.Provider value={cryptoFiatReducerValues as CryptoFiatContextState}>
          {children}
        </CryptoFiatContext.Provider>
      </XBridgeContext.Provider>
    </BiomeCombinedProviders>
  );
}

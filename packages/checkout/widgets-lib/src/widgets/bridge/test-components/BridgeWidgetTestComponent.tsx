import { BiomeCombinedProviders } from '@biom3/react';
import React, { useCallback, useMemo, useReducer } from 'react';
import { onDarkBase } from '@biom3/design-tokens';
import {
  initialBridgeState, BridgeContext, bridgeReducer, BridgeState,
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
  const [bridgeState, bridgeDispatch] = useReducer(bridgeReducer, initialStateOverride ?? initialBridgeState);

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
    <BiomeCombinedProviders theme={{ base: onDarkBase }}>
      <BridgeContext.Provider value={bridgeReducerValues}>
        <CryptoFiatContext.Provider value={cryptoFiatReducerValues as CryptoFiatContextState}>
          {children}
        </CryptoFiatContext.Provider>
      </BridgeContext.Provider>
    </BiomeCombinedProviders>
  );
}

import React, { useCallback, useMemo, useReducer } from 'react';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import {
  initialWalletState,
  WalletContext,
  walletReducer, WalletState,
} from '../context/WalletContext';
import {
  CryptoFiatContext, CryptoFiatContextState, CryptoFiatState, FiatSymbols,
} from '../../../context/crypto-fiat-context/CryptoFiatContext';

export interface TestProps {
  children: React.ReactNode;
  initialStateOverride?: WalletState;
  cryptoConversionsOverride?: Map<string, number>;
}

export function WalletWidgetTestComponent({
  children,
  initialStateOverride,
  cryptoConversionsOverride,
}: TestProps) {
  const [walletState, walletDispatch] = useReducer(
    walletReducer,
    initialStateOverride ?? initialWalletState,
  );

  const reducerValues = useMemo(
    () => ({ walletState, walletDispatch }),
    [walletState, walletDispatch],
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
      <WalletContext.Provider value={reducerValues}>
        <CryptoFiatContext.Provider value={cryptoFiatReducerValues as CryptoFiatContextState}>
          {children}
        </CryptoFiatContext.Provider>
      </WalletContext.Provider>
    </ViewContextTestComponent>
  );
}

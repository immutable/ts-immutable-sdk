import { BiomeCombinedProviders } from '@biom3/react';
import React, { useMemo, useReducer } from 'react';
import {
  initialWalletState,
  WalletContext,
  walletReducer, WalletState,
} from '../context/WalletContext';

export interface TestProps {
  children: React.ReactNode;
  initialStateOverride?: WalletState;
}

export function WalletWidgetTestComponent({ children, initialStateOverride }: TestProps) {
  const [walletState, walletDispatch] = useReducer(
    walletReducer,
    initialStateOverride ?? initialWalletState,
  );

  const reducerValues = useMemo(
    () => ({ walletState, walletDispatch }),
    [walletState, walletDispatch],
  );

  return (
    <BiomeCombinedProviders>
      <WalletContext.Provider value={reducerValues}>
        {children}
      </WalletContext.Provider>
    </BiomeCombinedProviders>
  );
}

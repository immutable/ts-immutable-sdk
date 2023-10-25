import {
  useReducer, ReactNode, useEffect, useCallback,
} from 'react';
import { CryptoFiat, CryptoFiatConfiguration } from '@imtbl/cryptofiat';
import { Environment } from '@imtbl/config';
import {
  CryptoFiatActions,
  CryptoFiatContext,
  cryptoFiatReducer,
  initialCryptoFiatState,
} from './CryptoFiatContext';
import { getCryptoToFiatConversion } from './CryptoFiat';

interface CryptoFiatProviderProps {
  environment: Environment;
  children: ReactNode;
}

export const DEFAULT_TOKEN_SYMBOLS = ['ETH', 'IMX'];

export function CryptoFiatProvider({ environment, children }: CryptoFiatProviderProps) {
  const cryptoFiat = new CryptoFiat(new CryptoFiatConfiguration({
    baseConfig: {
      environment,
    },
  }));

  const [cryptoFiatState, cryptoFiatDispatch] = useReducer(
    cryptoFiatReducer,
    {
      ...initialCryptoFiatState,
      cryptoFiat,
    },
  );

  const { fiatSymbol, tokenSymbols } = cryptoFiatState;

  const getConversions = useCallback(async () => {
    const conversions = await getCryptoToFiatConversion(
      cryptoFiat,
      fiatSymbol,
      [...new Set([...tokenSymbols, ...DEFAULT_TOKEN_SYMBOLS])],
    );

    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_CONVERSIONS,
        conversions,
      },
    });
  }, [fiatSymbol, cryptoFiat]);

  useEffect(() => {
    if (tokenSymbols.length === 0 || fiatSymbol.length === 0) return;
    getConversions();
  }, [tokenSymbols, fiatSymbol]);

  return (
    // TODO: The object passed as the value prop to the Context provider changes every render.
    // To fix this consider wrapping it in a useMemo hook.
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <CryptoFiatContext.Provider value={{ cryptoFiatState, cryptoFiatDispatch }}>
      {children}
    </CryptoFiatContext.Provider>
  );
}

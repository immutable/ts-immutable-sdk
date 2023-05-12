import { useReducer, ReactNode, useEffect } from 'react';
import {
  CryptoFiatActions,
  CryptoFiatContext,
  cryptoFiatReducer,
  initialCryptoFiatState,
} from './CryptoFiatContext';
import { getCryptoToFiatConversion } from './CryptoFiat';
import { CryptoFiat, CryptoFiatConfiguration } from '@imtbl/cryptofiat';

interface CryptoFiatProviderProps {
  children: ReactNode;
}

export const CryptoFiatProvider = ({ children }: CryptoFiatProviderProps) => {
  const [cryptoFiatState, cryptoFiatDispatch] = useReducer(
    cryptoFiatReducer,
    initialCryptoFiatState
  );

  const { cryptoFiat, fiatSymbol, tokenSymbols } = cryptoFiatState;

  useEffect(() => {
    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_CRYPTO_FIAT,
        cryptoFiat: new CryptoFiat(new CryptoFiatConfiguration({})),
      },
    });
  }, []);

  useEffect(() => {
    if (!cryptoFiat || tokenSymbols.length === 0 || !fiatSymbol) return;

    (async () => {
      const conversions = await getCryptoToFiatConversion(
        cryptoFiat,
        fiatSymbol,
        tokenSymbols
      );

      cryptoFiatDispatch({
        payload: {
          type: CryptoFiatActions.SET_CONVERSIONS,
          conversions,
        },
      });
    })();
  }, [cryptoFiat, tokenSymbols, fiatSymbol]);

  return (
    <CryptoFiatContext.Provider value={{ cryptoFiatState, cryptoFiatDispatch }}>
      {children}
    </CryptoFiatContext.Provider>
  );
};

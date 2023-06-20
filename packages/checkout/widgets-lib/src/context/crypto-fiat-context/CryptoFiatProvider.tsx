import { useReducer, ReactNode, useEffect } from 'react';
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

export function CryptoFiatProvider({ environment, children }: CryptoFiatProviderProps) {
  const [cryptoFiatState, cryptoFiatDispatch] = useReducer(
    cryptoFiatReducer,
    initialCryptoFiatState,
  );

  const { cryptoFiat, fiatSymbol, tokenSymbols } = cryptoFiatState;

  useEffect(() => {
    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_CRYPTO_FIAT,
        cryptoFiat: new CryptoFiat(new CryptoFiatConfiguration({
          baseConfig: {
            environment,
          },
        })),
      },
    });
  }, []);

  useEffect(() => {
    if (!cryptoFiat || tokenSymbols.length === 0 || !fiatSymbol) return;

    (async () => {
      const conversions = await getCryptoToFiatConversion(
        cryptoFiat,
        fiatSymbol,
        tokenSymbols,
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
    // TODO: The object passed as the value prop to the Context provider changes every render.
    // To fix this consider wrapping it in a useMemo hook.
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <CryptoFiatContext.Provider value={{ cryptoFiatState, cryptoFiatDispatch }}>
      {children}
    </CryptoFiatContext.Provider>
  );
}

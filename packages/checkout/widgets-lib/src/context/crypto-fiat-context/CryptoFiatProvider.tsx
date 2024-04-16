import {
  useReducer, ReactNode, useEffect, useRef,
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

export function CryptoFiatProvider({
  environment,
  children,
}: CryptoFiatProviderProps) {
  const [cryptoFiatState, cryptoFiatDispatch] = useReducer(
    cryptoFiatReducer,
    initialCryptoFiatState,
  );
  const fetching = useRef(false);
  const { cryptoFiat, fiatSymbol, tokenSymbols } = cryptoFiatState;

  useEffect(() => {
    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_CRYPTO_FIAT,
        cryptoFiat: new CryptoFiat(
          new CryptoFiatConfiguration({
            baseConfig: {
              environment,
            },
          }),
        ),
      },
    });
  }, []);

  useEffect(() => {
    if (!cryptoFiat || !fiatSymbol || fetching.current) {
      return;
    }

    (async () => {
      fetching.current = true;

      const symbolsList = [
        ...new Set([...tokenSymbols, ...DEFAULT_TOKEN_SYMBOLS]),
      ];

      const conversions = await getCryptoToFiatConversion(
        cryptoFiat,
        fiatSymbol,
        symbolsList,
      );

      fetching.current = false;
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

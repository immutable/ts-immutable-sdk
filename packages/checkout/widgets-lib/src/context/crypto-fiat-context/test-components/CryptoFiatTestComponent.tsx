import { useContext, useEffect } from 'react';
import { CryptoFiatActions, CryptoFiatContext } from '../CryptoFiatContext';

interface CryptoFiatTestComponentProps {
  tokenSymbols: any,
}

export function CryptoFiatTestComponent({ tokenSymbols }: CryptoFiatTestComponentProps) {
  const { cryptoFiatDispatch } = useContext(CryptoFiatContext);

  useEffect(() => {
    (async () => {
      cryptoFiatDispatch({
        payload: {
          type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
          tokenSymbols,
        },
      });
    })();
  }, [cryptoFiatDispatch]);

  return (
    <>CryptoFiatTestComponent</>
  );
}

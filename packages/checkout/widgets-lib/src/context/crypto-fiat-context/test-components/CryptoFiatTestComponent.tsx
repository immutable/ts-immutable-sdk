import { useContext, useEffect } from 'react';
import { CryptoFiatActions, CryptoFiatContext } from '../CryptoFiatContext';

interface CryptoFiatTestComponentProps {
  tokenSymbols: string[],
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cryptoFiatDispatch]);

  return (
    <>CryptoFiatTestComponent</>
  );
}

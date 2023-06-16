import { Checkout, TokenFilterTypes } from '@imtbl/checkout-sdk';
import { useEffect } from 'react';
import { CryptoFiatAction, CryptoFiatActions } from '../../context/crypto-fiat-context/CryptoFiatContext';

// Hook to set the token symbols in the CryptoFiat context
export function useTokenSymbols(
  checkout: Checkout | null,
  cryptoFiatDispatch: React.Dispatch<CryptoFiatAction>,
) {
  useEffect(() => {
    if (!checkout) return;

    (async () => {
      const tokenAllowList = await checkout.getTokenAllowList({
        type: TokenFilterTypes.ALL,
      });

      const symbolSet = new Set<string>();

      tokenAllowList.tokens.forEach((token) => {
        symbolSet.add(token.symbol);
      });

      const tokenSymbols = Array.from(symbolSet);

      cryptoFiatDispatch({
        payload: {
          type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
          tokenSymbols,
        },
      });
    })();
  }, [checkout, cryptoFiatDispatch]);
}

import {
  ChainId,
  Checkout, TokenFilterTypes, TokenInfo,
} from '@imtbl/checkout-sdk';
import { useEffect } from 'react';
import { CryptoFiatAction, CryptoFiatActions } from '../../context/crypto-fiat-context/CryptoFiatContext';
import { l1Network, zkEVMNetwork } from '../networkUtils';

// Hook to set the token symbols in the CryptoFiat context
// if no chainId is passed then it will use the environment
// to fetch all the tokens for the chains for the given
// environment
export function useTokenSymbols(
  checkout: Checkout | null,
  cryptoFiatDispatch: React.Dispatch<CryptoFiatAction>,
  chainIds?: ChainId[],
) {
  useEffect(() => {
    if (!checkout) return;
    (async () => {
      let localChainIds = chainIds;
      if (!localChainIds || localChainIds.length === 0) {
        const env = checkout.config.environment;
        localChainIds = [l1Network(env), zkEVMNetwork(env)];
      }

      const tokenAllowList: TokenInfo[] = [];

      const promises = localChainIds.map(async (id) => await checkout.getTokenAllowList({
        type: TokenFilterTypes.ALL,
        chainId: id,
      }));

      (await Promise.allSettled(promises)).forEach((result) => {
        if (result.status === 'fulfilled') tokenAllowList.push(...result.value.tokens);
      });

      const symbolSet = new Set<string>();

      tokenAllowList.forEach((token) => {
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

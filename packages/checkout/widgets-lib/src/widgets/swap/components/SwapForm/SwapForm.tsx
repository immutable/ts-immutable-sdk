import { useContext, useEffect, useState } from 'react';
import { Box } from '@biom3/react';
import {
  SwapFormActions,
  SwapFormContext,
} from '../../context/swap-form-context/SwapFormContext';
import {
  swapFormContainerStyle,
} from './SwapFormStyles';
import { SwapContext } from '../../context/swap-context/SwapContext';
import { CryptoFiatActions, CryptoFiatContext } from '../../../../context/crypto-fiat-context/CryptoFiatContext';
import { calculateCryptoToFiat } from '../../../../lib/utils';
import { From } from './From';
import { To } from './To';

const DEBOUNCE_TIME = 2000;

export function SwapForm() {
  const { swapState } = useContext(SwapContext);
  const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  const {
    swapFromAmount, swapFromToken, swapToToken,
    blockFetchQuote,
  } = swapFormState;
  const { allowedTokens } = swapState;
  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const [debounceId, setDebounceId] = useState<string | null>();

  const debounce = (func: () => void, threshold: number) => {
    if (debounceId) {
      clearTimeout(debounceId);
    }

    setDebounceId(
      setTimeout(() => {
        setDebounceId(null);
        func();
      }, threshold).toString(),
    );
  };

  useEffect(() => {
    const tokenSymbols: string[] = [];
    allowedTokens.forEach((token) => {
      tokenSymbols.push(token.symbol);
    });

    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols,
      },
    });
  }, [cryptoFiatDispatch, allowedTokens]);

  useEffect(() => {
    if (!swapFormState.swapFromAmount) {
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_FROM_FIAT_VALUE,
          swapFromFiatValue: '0.00',
        },
      });
    }

    if (swapFormState.swapFromAmount && swapFormState.swapFromToken) {
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_FROM_FIAT_VALUE,
          swapFromFiatValue: calculateCryptoToFiat(
            swapFormState.swapFromAmount,
            swapFormState.swapFromToken.token.symbol,
            cryptoFiatState.conversions,
          ),
        },
      });
    }
  }, [cryptoFiatState.conversions, swapFormState.swapFromAmount, swapFormState.swapFromToken]);

  // Listening to state changes in the useEffect will ensure the most updated values
  // are received from the SwapForm context state, then we can conditionally fetch a quote
  useEffect(() => {
    // Fetch the quote from the DEX when the following conditions are met
    if (!Number.isNaN(parseFloat(swapFromAmount))
      && parseFloat(swapFromAmount) > 0
      && swapFromToken
      && swapToToken
      && !blockFetchQuote
    ) {
      // eslint-disable-next-line no-console
      console.log('todo: Fetch the quote');
    }

    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
        blockFetchQuote: true,
      },
    });
  }, [swapFromAmount, swapFromToken, swapToToken, blockFetchQuote]);

  return (
    <Box sx={swapFormContainerStyle}>
      <From debounceTime={DEBOUNCE_TIME} debounce={debounce} />
      <To debounceTime={DEBOUNCE_TIME} debounce={debounce} />
    </Box>
  );
}

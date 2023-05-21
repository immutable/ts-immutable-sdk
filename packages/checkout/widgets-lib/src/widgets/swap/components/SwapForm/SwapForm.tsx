import { useCallback, useContext, useEffect } from 'react';
import { Box } from '@biom3/react';
import { utils } from 'ethers';
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
import { DEFAULT_IMX_DECIMALS } from '../../../../lib/constant';
import { quotesProcessor } from '../../functions/FetchQuote';

export function SwapForm() {
  const {
    swapState: {
      allowedTokens,
      provider,
      exchange,
    },
  } = useContext(SwapContext);

  const {
    swapFormState: {
      swapFromAmount,
      swapFromToken,
      swapToToken,
      blockFetchQuote,
    }, swapFormDispatch,
  } = useContext(SwapFormContext);

  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);

  const blockQuoteToggle = useCallback((value: boolean) => {
    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
        blockFetchQuote: value,
      },
    });
  }, []);

  const loadingToggle = useCallback((value: boolean) => {
    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_LOADING,
        loading: value,
      },
    });
  }, []);

  useEffect(() => {
    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols: allowedTokens.map((token) => token.symbol),
      },
    });
  }, [cryptoFiatDispatch, allowedTokens]);

  useEffect(() => {
    if (!swapFromAmount || !swapFromToken) return;
    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_SWAP_FROM_FIAT_VALUE,
        swapFromFiatValue: calculateCryptoToFiat(
          swapFromAmount,
          swapFromToken.token.symbol,
          cryptoFiatState.conversions,
        ),
      },
    });
  }, [cryptoFiatState.conversions, swapFromAmount, swapFromToken]);

  const fetchQuote = async () => {
    if (blockFetchQuote) return;
    if (!provider) return;
    if (!exchange) return;
    if (Number.isNaN(parseFloat(swapFromAmount))) return;
    if (parseFloat(swapFromAmount) <= 0) return;
    if (!swapFromToken) return;
    if (!swapToToken) return;

    loadingToggle(true);

    try {
      const result = await quotesProcessor.fromAmountIn(
        exchange,
        provider,
        swapFromToken.token,
        swapFromAmount,
        swapToToken,
      );

      const gasFee = utils.formatUnits(
        result.info.gasFeeEstimate?.amount || 0,
        DEFAULT_IMX_DECIMALS,
      );
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_QUOTE,
          quote: result,
          gasFeeValue: gasFee,
          gasFeeFiatValue: calculateCryptoToFiat(
            gasFee,
            DEFAULT_IMX_DECIMALS.toString(),
            cryptoFiatState.conversions,
          ),
        },
      });

      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_TO_AMOUNT,
          swapToAmount: utils.formatUnits(
            result.info.quote.amount,
            result.info.quote.token.decimals,
          ),
        },
      });
    } catch (error: any) {
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_QUOTE_ERROR,
          quoteError: error.message,
        },
      });
    }

    blockQuoteToggle(true);
    loadingToggle(false);
  };

  // Listening to state changes in the useEffect will ensure the most updated values
  // are received from the SwapForm context state, then we can conditionally fetch a quote
  useEffect(() => {
    blockQuoteToggle(false);
    fetchQuote();
  }, [
    provider,
    exchange,
    swapFromAmount,
    swapFromToken,
    swapToToken,
  ]);

  return (
    <Box sx={swapFormContainerStyle}>
      <From unblockQuote={() => blockQuoteToggle(false)} />
      <To unblockQuote={() => blockQuoteToggle(false)} />
    </Box>
  );
}

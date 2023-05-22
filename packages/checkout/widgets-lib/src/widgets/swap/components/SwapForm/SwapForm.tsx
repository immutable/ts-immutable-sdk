/* eslint-disable */
import {
  useCallback, useContext, useEffect, useState,
} from 'react';
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

export function SwapForm({ setLoading }: { setLoading: (value: boolean) => void }) {
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

  const [isFetching, setIsFetching] = useState(false);

  const blockQuoteToggle = useCallback((value: boolean) => {
    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
        blockFetchQuote: value,
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

  const fetchQuoteFrom = async () => {
    try {
      const result = await quotesProcessor.fromAmountIn(
        exchange,
        provider,
        swapFromToken.token,
        swapFromAmount,
        swapToToken,
      );

      const estimate = result.info.gasFeeEstimate;
      const gasFee = utils.formatUnits(
        estimate?.amount || 0,
        DEFAULT_IMX_DECIMALS,
      );
      const estimateToken = estimate?.token;

      const gasToken = allowedTokens.find((token) => token.symbol === estimateToken?.symbol);
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_QUOTE,
          quote: result,
          gasFeeValue: gasFee,
          gasFeeToken: {
            name: gasToken?.name || '',
            symbol: gasToken?.symbol || '',
            decimals: gasToken?.decimals || 0,
            address: gasToken?.address,
            icon: gasToken?.icon,
          },
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
  };

  const fetchQuote = async ({ direction }) => {
    if (!provider) return;
    if (!exchange) return;

    if (direction === 'from') {
      if (Number.isNaN(parseFloat(swapFromAmount))) return;
      if (parseFloat(swapFromAmount) <= 0) return;
      if (!swapFromToken) return;
      if (!swapToToken) return;

      if (isFetching) return;
      setIsFetching(true);
      fetchQuoteFrom();
      setIsFetching(false);
      return;
    }

    if (Number.isNaN(parseFloat(swapFromAmount))) return;
    if (parseFloat(swapFromAmount) <= 0) return;
    if (!swapFromToken) return;
    if (!swapToToken) return;

    if (isFetching) return;
    setIsFetching(true);
    fetchQuoteTo();
    setIsFetching(false);
  };

  return (
    <Box sx={swapFormContainerStyle}>
      <From fetchQuote />
      <To fetchQuote />
    </Box>
  );
}

import {
  useContext, useEffect, useState,
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

interface SwapFormProps {
  setLoading: (value: boolean) => void;
}

enum SwapDirection {
  FROM = 'FROM',
  TO = 'TO',
}

export function SwapForm({ setLoading }: SwapFormProps) {
  const {
    swapState: {
      allowedTokens,
      provider,
      exchange,
    },
  } = useContext(SwapContext);

  const [isFetching, setIsFetching] = useState(false);

  const {
    swapFormState: {
      swapFromAmount,
      swapToAmount,
      swapFromToken,
      swapToToken,
    }, swapFormDispatch,
  } = useContext(SwapFormContext);

  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);

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
    if (!provider) return;
    if (!exchange) return;
    if (!swapFromToken) return;
    if (!swapToToken) return;

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

    setIsFetching(false);
    setLoading(false);
  };

  const fetchQuoteTo = async () => {
    // eslint-disable-next-line no-console
    console.log('todo: implement fetch quote to: ', swapToAmount);
  };

  const disableFields = async () => {
    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_DISABLE_FIELDS,
      },
    });
  };

  const enableFields = async () => {
    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_ENABLE_FIELDS,
      },
    });
  };

  const fetchQuote = async (direction: SwapDirection) => {
    if (direction === SwapDirection.FROM) {
      if (Number.isNaN(parseFloat(swapFromAmount))) return;
      if (parseFloat(swapFromAmount) <= 0) return;
      if (!swapFromToken) return;
      if (!swapToToken) return;

      if (isFetching) return;
      setLoading(true);
      setIsFetching(true);
      disableFields();
      await fetchQuoteFrom();
      setLoading(false);
      setIsFetching(false);
      enableFields();
      return;
    }

    if (Number.isNaN(parseFloat(swapFromAmount))) return;
    if (parseFloat(swapFromAmount) <= 0) return;
    if (!swapFromToken) return;
    if (!swapToToken) return;

    if (isFetching) return;
    setLoading(true);
    setIsFetching(true);
    disableFields();
    await fetchQuoteTo();
    setLoading(false);
    setIsFetching(false);
    enableFields();
  };

  return (
    <Box sx={swapFormContainerStyle}>
      <From fetchQuote={() => fetchQuote(SwapDirection.FROM)} />
      <To fetchQuote={() => fetchQuote(SwapDirection.TO)} />
    </Box>
  );
}

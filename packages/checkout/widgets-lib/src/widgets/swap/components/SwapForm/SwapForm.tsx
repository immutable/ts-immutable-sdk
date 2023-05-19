import { useCallback, useContext, useEffect } from 'react';
import { Box } from '@biom3/react';
import {
  Exchange, ExchangeConfiguration,
} from '@imtbl/dex-sdk';
import { ImmutableConfiguration, Environment } from '@imtbl/config';
import { BigNumber, utils } from 'ethers';
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

export function SwapForm() {
  const { swapState } = useContext(SwapContext);
  const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  const {
    swapFromAmount, swapFromToken, swapToToken,
    blockFetchQuote,
  } = swapFormState;
  const { allowedTokens, provider } = swapState;
  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const exchange = new Exchange(new ExchangeConfiguration({
    chainId: 1442,
    baseConfig: new ImmutableConfiguration({ environment: Environment.SANDBOX }),
  }));

  const unblockQuote = useCallback(() => {
    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
        blockFetchQuote: false,
      },
    });
  }, []);

  const blockQuote = useCallback(() => {
    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
        blockFetchQuote: true,
      },
    });
  }, []);

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
      // TODO: this section will need to be updated with WT-1331
      swapFormDispatch({
        payload:
        {
          type: SwapFormActions.SET_LOADING,
          loading: true,
        },
      });

      const func = async () => {
        const address = await provider?.getSigner().getAddress();
        console.log(swapFromToken);
        const result = await exchange.getUnsignedSwapTxFromAmountIn(
          address!,
          swapFromToken.token.address || '',
          swapToToken.address || '',
          BigNumber.from(utils.parseUnits(swapFromAmount, swapFromToken.token.decimals)),
        );

        swapFormDispatch({
          payload: {
            type: SwapFormActions.SET_SWAP_TO_AMOUNT,
            swapToAmount: utils.formatUnits(
              result.info.quote.amount,
              result.info.quote.token.decimals,
            ),
          },
        });

        console.log(result);
        swapFormDispatch({
          payload:
          {
            type: SwapFormActions.SET_LOADING,
            loading: false,
          },
        });
      };

      func();
    }

    blockQuote();
  }, [swapFromAmount, swapFromToken, swapToToken, blockFetchQuote, blockQuote]);

  return (
    <Box sx={swapFormContainerStyle}>
      <From unblockQuote={unblockQuote} />
      <To unblockQuote={unblockQuote} />
    </Box>
  );
}

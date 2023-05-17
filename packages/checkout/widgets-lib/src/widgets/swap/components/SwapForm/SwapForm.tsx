import {
  useCallback, useContext, useEffect, useMemo,
  useState,
} from 'react';
import {
  Body, Box, Heading, OptionKey,
} from '@biom3/react';
import { SelectInput } from '../../../../components/FormComponents/SelectInput/SelectInput';
import { amountInputValidation } from '../../../../lib/validations/amountInputValidations';
import {
  SwapFormActions,
  SwapFormContext,
} from '../../context/swap-form-context/SwapFormContext';
import {
  swapFormContainerStyle,
  toHeadingBodyStyle,
  headingStyle,
} from './SwapFormStyles';
import { text } from '../../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../../context/view-context/SwapViewContextTypes';
import { SwapContext } from '../../context/swap-context/SwapContext';
import { SelectOption } from '../../../../components/FormComponents/SelectForm/SelectForm';
import { CryptoFiatActions, CryptoFiatContext } from '../../../../context/crypto-fiat-context/CryptoFiatContext';
import { calculateCryptoToFiat } from '../../../../lib/utils';

export function SwapForm() {
  const { swapState } = useContext(SwapContext);
  const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  const { content, swapForm } = text.views[SwapWidgetViews.SWAP];
  const {
    swapFromAmount, swapFromToken, swapToAmount, swapToToken,
    blockFetchQuote,
  } = swapFormState;
  const { tokenBalances, allowedTokens } = swapState;
  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const [debounceId, setDebounceId] = useState<string | null>();

  const debounce = (func: () => {}, threshold: number) => {
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

  // extract these to context or calculate on render
  const fromToConversionText = '1 WETH ≈ 12.6 GOG'; // TODO: to calculate when dex integrated
  const fromFiatPriceText = `${content.fiatPricePrefix} $${swapFormState.swapFromFiatValue}`;
  const availableFromBalanceSubtext = swapFromToken
    ? `${content.availableBalancePrefix} ${swapFromToken?.formattedBalance}`
    : ''; // todo: update with actual values

  const fromTokensOptions = useMemo(
    () => tokenBalances.filter((balance) => balance.balance.gt(0)).map(
      (tokenBalance) => ({
        id: `${tokenBalance.token.symbol}-${tokenBalance.token.name}`,
        label: tokenBalance.token.symbol,
        icon: tokenBalance.token.icon, // todo: add correct image once available on token info
      } as SelectOption),
    ),
    [tokenBalances],
  );

  const toTokenOptions = useMemo(
    () => allowedTokens.map(
      (token) => ({
        id: `${token.symbol}-${token.name}`,
        label: token.symbol,
        icon: undefined, // todo: add correct image once available on token info
      } as SelectOption),
    ),
    [allowedTokens, swapFromToken],
  );

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
  }, [cryptoFiatDispatch, fromTokensOptions]);

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

  const handleFromTokenChange = useCallback(
    (value: OptionKey) => {
      const selectedTokenOption = tokenBalances.find(
        (tokenBalance) => value === `${tokenBalance.token.symbol}-${tokenBalance.token.name}`,
      );

      if (selectedTokenOption) {
        swapFormDispatch({
          payload: {
            type: SwapFormActions.SET_SWAP_FROM_TOKEN,
            swapFromToken: selectedTokenOption,
          },
        });
      }

      debounce(() => {
        // console.log('unblocking fetch quote after debounce');
        swapFormDispatch({
          payload: {
            type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
            blockFetchQuote: false,
          },
        });
        return {};
      }, 2000);
    },
    [tokenBalances, swapFormDispatch, swapToToken],
  );

  const handleToTokenChange = useCallback(
    (value: OptionKey) => {
      const selectedTokenOption = allowedTokens.find(
        (token) => value === `${token.symbol}-${token.name}`,
      );

      if (selectedTokenOption) {
        swapFormDispatch({
          payload: {
            type: SwapFormActions.SET_SWAP_TO_TOKEN,
            swapToToken: selectedTokenOption,
          },
        });
      }

      debounce(() => {
        // console.log('unblocking fetch quote after debounce');
        swapFormDispatch({
          payload: {
            type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
            blockFetchQuote: false,
          },
        });
        return {};
      }, 2000);
    },
    [allowedTokens, swapFormDispatch],
  );

  // downside I see to this method is that we will have to pass in one of the values
  // const fetchQuoteIfAvailable = useCallback(() => {
  //   // fetch quote on certain conditions
  //   if (!Number.isNaN(parseFloat(swapFromAmount))
  //     && parseFloat(swapFromAmount) > 0
  //     && swapFromToken
  //     && swapToToken
  //   ) {
  //     console.log('### FETCHING QUOTE ###');
  //   }
  // }, [swapFromAmount, swapFromToken, swapToToken]);

  // listening to state changes in a useEffect is handy as it will receive the most updated
  // values of the form context state, then we can conditionally fetch a quote
  useEffect(() => {
    // fetch quote on certain conditions
    if (!Number.isNaN(parseFloat(swapFromAmount))
      && parseFloat(swapFromAmount) > 0
      && swapFromToken
      && swapToToken
      && !blockFetchQuote
    ) {
      console.log('### FETCHING QUOTE ###');
    }

    // console.log('blocking fetch quote');
    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
        blockFetchQuote: true,
      },
    });
  }, [swapFromAmount, swapFromToken, swapToToken,
    blockFetchQuote,
  ]);

  const handleSwapFromMaxButtonClick = useCallback(() => {
    if (!swapFromToken) return;
    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_SWAP_FROM_AMOUNT,
        swapFromAmount: swapFromToken.formattedBalance,
      },
    });
  }, [swapFromToken]);

  return (
    <Box sx={swapFormContainerStyle}>
      <Box>
        <Heading size="xSmall" sx={headingStyle}>
          {swapForm.from.label}
        </Heading>
        <SelectInput
          testId="fromTokenInputs"
          options={fromTokensOptions}
          selectSubtext={availableFromBalanceSubtext}
          selectTextAlign="left"
          textInputValue={swapFromAmount}
          textInputPlaceholder={swapForm.from.inputPlaceholder}
          textInputSubtext={fromFiatPriceText}
          textInputTextAlign="right"
          textInputValidator={amountInputValidation}
          // eslint-disable-next-line no-console
          onTextInputFocus={() => {
            // block fetching of quote when a user focuses the input
            // conversely stop blocking on blur or after debounce time

            // console.log('blocking fetch quote');
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
                blockFetchQuote: true,
              },
            });
          }}
          onTextInputChange={(value) => {
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_SWAP_FROM_AMOUNT,
                swapFromAmount: value,
              },
            });
            debounce(() => {
              // console.log('unblocking fetch quote after debounce');
              swapFormDispatch({
                payload: {
                  type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
                  blockFetchQuote: false,
                },
              });
              return {};
            }, 2000);
          }}
          onTextInputBlur={(value: string) => {
            // eslint-disable-next-line no-console
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_SWAP_FROM_AMOUNT,
                swapFromAmount: value,
              },
            });
            // console.log('unblocking fetch quote');
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
                blockFetchQuote: false,
              },
            });
          }}
          textInputMaxButtonClick={handleSwapFromMaxButtonClick}
          onSelectChange={handleFromTokenChange}
        />
      </Box>
      <Box>
        <Box sx={headingStyle}>
          <Heading size="xSmall">{swapForm.to.label}</Heading>
          <Body sx={toHeadingBodyStyle} size="small">
            {fromToConversionText}
          </Body>
        </Box>
        <SelectInput
          testId="toTokenInputs"
          options={toTokenOptions}
          textInputValue={swapToAmount}
          textInputPlaceholder={swapForm.to.inputPlaceholder}
          textInputTextAlign="right"
          textInputValidator={amountInputValidation}
          // eslint-disable-next-line no-console
          onTextInputFocus={() => console.log('Swap To Text Input Focused')}
          onTextInputChange={(value) => {
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_SWAP_TO_AMOUNT,
                swapToAmount: value,
              },
            });
          }}
          onTextInputBlur={(value: string) => {
            // eslint-disable-next-line no-console
            console.log(`Swap To Amount onBlur ${value}`);
          }}
          textInputMaxButtonClick={() => {
            // eslint-disable-next-line no-console
            console.log('todo: implement max button function');
          }}
          onSelectChange={handleToTokenChange}
        />
      </Box>
    </Box>
  );
}

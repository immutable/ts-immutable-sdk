import { Box, Heading, OptionKey } from '@biom3/react';
import { useCallback, useContext, useMemo } from 'react';
import { SelectInput } from '../../../../components/FormComponents/SelectInput/SelectInput';
import { amountInputValidation } from '../../../../lib/validations/amountInputValidations';
import { SwapFormActions, SwapFormContext } from '../../context/swap-form-context/SwapFormContext';
import { headingStyle } from './SwapFormStyles';
import { SelectOption } from '../../../../components/FormComponents/SelectForm/SelectForm';
import { SwapContext } from '../../context/swap-context/SwapContext';
import { SwapWidgetViews } from '../../../../context/view-context/SwapViewContextTypes';
import { text } from '../../../../resources/text/textConfig';
import { ValidateAmount } from '../../functions/SwapValidator';

interface FromProps {
  debounceTime: number;
  debounce: (func: () => {}, threshold: number) => void;
}

export function From({ debounceTime, debounce }: FromProps) {
  const { swapState } = useContext(SwapContext);
  const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  const { tokenBalances } = swapState;
  const { content, swapForm } = text.views[SwapWidgetViews.SWAP];

  const {
    swapFromAmount, swapFromToken, swapToToken, swapFromTokenError, swapFromAmountError,
  } = swapFormState;

  const availableFromBalanceSubtext = swapFromToken
    ? `${content.availableBalancePrefix} ${swapFromToken?.formattedBalance}`
    : '';
  const fromFiatPriceText = `${content.fiatPricePrefix} $${swapFormState.swapFromFiatValue}`;

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

        swapFormDispatch({
          payload: {
            type: SwapFormActions.SET_SWAP_FROM_TOKEN_ERROR,
            swapFromTokenError: '',
          },
        });
      }

      // Focuses on the From input field when the From token is updated
      document.getElementById('fromTokenInputs-text-form-text')?.focus();

      // Clears the To input field when the From token is updated
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_TO_AMOUNT,
          swapToAmount: '',
        },
      });

      // TODO: clear the quote value here

      debounce(() => {
        swapFormDispatch({
          payload: {
            type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
            blockFetchQuote: false,
          },
        });
        return {};
      }, debounceTime);
    },
    [tokenBalances, swapFormDispatch, swapToToken],
  );

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
    <Box>
      <Heading size="xSmall" sx={headingStyle}>
        {swapForm.from.label}
      </Heading>
      <SelectInput
        id="fromTokenInputs"
        options={fromTokensOptions}
        selectSubtext={availableFromBalanceSubtext}
        selectTextAlign="left"
        textInputValue={swapFromAmount}
        textInputPlaceholder={swapForm.from.inputPlaceholder}
        textInputSubtext={fromFiatPriceText}
        textInputTextAlign="right"
        textInputValidator={amountInputValidation}
        onTextInputFocus={() => {
          // block fetching of quote when a user focuses the input
          // conversely stop blocking on blur or after debounce time
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
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
                blockFetchQuote: false,
              },
            });
            return {};
          }, debounceTime);
        }}
        onTextInputBlur={() => {
          const validateFromAmountError = ValidateAmount(swapFromAmount);
          if (validateFromAmountError) {
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_SWAP_FROM_AMOUNT_ERROR,
                swapFromAmountError: validateFromAmountError,
              },
            });
            return;
          }

          swapFormDispatch({
            payload: {
              type: SwapFormActions.SET_SWAP_FROM_AMOUNT_ERROR,
              swapFromAmountError: '',
            },
          });
        }}
        textInputMaxButtonClick={handleSwapFromMaxButtonClick}
        onSelectChange={handleFromTokenChange}
        textInputErrorMessage={swapFromAmountError}
        selectErrorMessage={swapFromTokenError}
      />
    </Box>
  );
}

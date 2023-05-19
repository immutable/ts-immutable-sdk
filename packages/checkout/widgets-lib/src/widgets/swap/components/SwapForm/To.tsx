import {
  Box, Heading, Body, OptionKey,
} from '@biom3/react';
import { useCallback, useContext, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { SelectInput } from '../../../../components/FormComponents/SelectInput/SelectInput';
import { amountInputValidation } from '../../../../lib/validations/amountInputValidations';
import { SwapFormActions, SwapFormContext } from '../../context/swap-form-context/SwapFormContext';
import { headingStyle, toHeadingBodyStyle } from './SwapFormStyles';
import { SwapWidgetViews } from '../../../../context/view-context/SwapViewContextTypes';
import { text } from '../../../../resources/text/textConfig';
import { SelectOption } from '../../../../components/FormComponents/SelectForm/SelectForm';
import { SwapContext } from '../../context/swap-context/SwapContext';
import { ValidateToAmount } from '../../functions/SwapValidator';
import { SELECT_DEBOUNCE_TIME } from '../../constants';

export interface ToProps {
  unblockQuote: () => void;
}

export function To({ unblockQuote }: ToProps) {
  const { swapState } = useContext(SwapContext);
  const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  const {
    swapFromToken, swapToAmount, swapToTokenError, swapToAmountError,
  } = swapFormState;
  const { allowedTokens } = swapState;
  const { swapForm } = text.views[SwapWidgetViews.SWAP];
  const fromToConversionText = '1 WETH ≈ 12.6 GOG'; // TODO: to calculate when dex integrated

  const unblockQuoteOnSelectDebounce = useCallback(debounce(() => {
    unblockQuote();
  }, SELECT_DEBOUNCE_TIME), []);

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

        swapFormDispatch({
          payload: {
            type: SwapFormActions.SET_SWAP_TO_TOKEN_ERROR,
            swapToTokenError: '',
          },
        });
      }

      unblockQuoteOnSelectDebounce();
    },
    [allowedTokens, swapFormDispatch, unblockQuoteOnSelectDebounce],
  );

  const handleToAmountValidation = useCallback((value: string) => {
    const validateToAmountError = ValidateToAmount(value);
    if (validateToAmountError) {
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_TO_AMOUNT_ERROR,
          swapToAmountError: validateToAmountError,
        },
      });
      return;
    }

    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_SWAP_TO_AMOUNT_ERROR,
        swapToAmountError: '',
      },
    });
  }, []);

  const handleToAmountFocus = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Swap To Text Input Focused');
  }, []);

  const handleToAmountChange = useCallback((value: string) => {
    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_SWAP_TO_AMOUNT,
        swapToAmount: value,
      },
    });
  }, []);

  const handleToAmountMaxButtonClick = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('todo: implement max button function');
  }, []);

  return (
    <Box>
      <Box sx={headingStyle}>
        <Heading size="xSmall">{swapForm.to.label}</Heading>
        <Body sx={toHeadingBodyStyle} size="small">
          {fromToConversionText}
        </Body>
      </Box>
      <SelectInput
        id="toTokenInputs"
        options={toTokenOptions}
        textInputValue={swapToAmount}
        textInputPlaceholder={swapForm.to.inputPlaceholder}
        textInputTextAlign="right"
        textInputValidator={amountInputValidation}
        onTextInputFocus={handleToAmountFocus}
        onTextInputChange={(value) => handleToAmountChange(value)}
        onTextInputBlur={(value) => handleToAmountValidation(value)}
        textInputMaxButtonClick={handleToAmountMaxButtonClick}
        onSelectChange={handleToTokenChange}
        textInputErrorMessage={swapToAmountError}
        selectErrorMessage={swapToTokenError}
      />
    </Box>
  );
}

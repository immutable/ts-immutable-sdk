import {
  Box, Heading, Body, OptionKey,
} from '@biom3/react';
import { useCallback, useContext, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { SelectInput } from '../../../../components/FormComponents/SelectInput/SelectInput';
import { amountInputValidation } from '../../../../lib/validations/amountInputValidations';
import { SwapFormActions, SwapFormContext, SwapFormState } from '../../context/swap-form-context/SwapFormContext';
import { headingStyle, toHeadingBodyStyle } from './SwapFormStyles';
import { SwapWidgetViews } from '../../../../context/view-context/SwapViewContextTypes';
import { text } from '../../../../resources/text/textConfig';
import { SelectOption } from '../../../../components/FormComponents/SelectForm/SelectForm';
import { SwapContext } from '../../context/swap-context/SwapContext';
import { ValidateToAmount } from '../../functions/SwapValidator';
import { SELECT_DEBOUNCE_TIME } from '../../constants';
import { tokenValueFormat } from '../../../../lib/utils';

export interface ToProps {
  unblockQuote: () => void;
}

const swapValuesToText = ({
  swapFromToken,
  swapToToken,
  swapFromAmount,
  swapToAmount,
}: SwapFormState): {
  fromToConversion: string,
  swapToAmount: string,
} => {
  if (!(swapToAmount && swapFromAmount && swapFromToken && swapToToken)) {
    return {
      fromToConversion: '',
      swapToAmount: '',
    };
  }
  const conversionRatio = tokenValueFormat(Number(swapToAmount) / Number(swapFromAmount));
  return {
    fromToConversion: `1 ${swapFromToken.token.symbol} ≈ ${conversionRatio} ${swapToToken.symbol}`,
    swapToAmount: tokenValueFormat(swapToAmount),
  };
};

export function To({ unblockQuote }: ToProps) {
  const { swapState } = useContext(SwapContext);
  const { allowedTokens } = swapState;

  const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  const {
    loading,
    swapFromToken,
    swapToTokenError,
    swapToAmountError,
  } = swapFormState;

  const staticText = text.views[SwapWidgetViews.SWAP].swapForm;
  const swapValuesText = swapValuesToText(swapFormState);

  const unblockQuoteOnSelectDebounce = useCallback(debounce(() => {
    unblockQuote();
  }, SELECT_DEBOUNCE_TIME), []);

  const toTokenOptions = useMemo(
    () => allowedTokens.filter(
      // Cannot get a quote for the same token
      (token) => token.address !== swapFromToken?.token.address,
    ).map(
      (token) => ({
        id: `${token.symbol}-${token.name}`,
        label: token.symbol,
        icon: token.icon,
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
      }

      unblockQuoteOnSelectDebounce();
    },
    [allowedTokens, swapFormDispatch, unblockQuoteOnSelectDebounce],
  );

  const handleToAmountValidation = useCallback((value: string) => {
    const validateToAmountError = ValidateToAmount(value);
    if (!validateToAmountError) return;

    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_SWAP_TO_AMOUNT_ERROR,
        swapToAmountError: validateToAmountError,
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

  return (
    <Box>
      <Box sx={headingStyle}>
        <Heading size="xSmall">{staticText.to.label}</Heading>
        <Body sx={toHeadingBodyStyle} size="small">
          {!loading && swapValuesText.fromToConversion}
        </Body>
      </Box>
      <SelectInput
        id="toTokenInputs"
        options={toTokenOptions}
        textInputValue={swapValuesText.swapToAmount}
        textInputPlaceholder={staticText.to.inputPlaceholder}
        textInputTextAlign="right"
        textInputValidator={amountInputValidation}
        onTextInputFocus={handleToAmountFocus}
        onTextInputChange={handleToAmountChange}
        onTextInputBlur={handleToAmountValidation}
        onSelectChange={handleToTokenChange}
        textInputErrorMessage={swapToAmountError}
        selectErrorMessage={swapToTokenError}
      />
    </Box>
  );
}

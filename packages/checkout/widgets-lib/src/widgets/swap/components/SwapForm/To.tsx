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
import { formatZeroAmount, tokenValueFormat } from '../../../../lib/utils';

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
  const resp = {
    fromToConversion: '',
    swapToAmount: '',
  };

  if (!swapToAmount) return resp;
  resp.swapToAmount = tokenValueFormat(swapToAmount);

  if (swapFromAmount && swapFromToken && swapToToken) {
    const conversionRatio = tokenValueFormat(Number(swapToAmount) / Number(swapFromAmount));
    resp.fromToConversion = `1 ${swapFromToken.token.symbol} ≈ ${
      formatZeroAmount(conversionRatio, true)
    } ${swapToToken.symbol}`;
  }

  return resp;
};

export function To({ unblockQuote }: ToProps) {
  const { swapState } = useContext(SwapContext);
  const { allowedTokens } = swapState;

  const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  const {
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
      }

      unblockQuoteOnSelectDebounce();
    },
    [allowedTokens, swapFormDispatch, unblockQuoteOnSelectDebounce],
  );

  const handleToAmountValidation = (value: string) => {
    const validateToAmountError = ValidateToAmount(value);
    if (!validateToAmountError) return;

    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_SWAP_TO_AMOUNT_ERROR,
        swapToAmountError: validateToAmountError,
      },
    });
  };

  const handleToAmountFocus = () => {
    // eslint-disable-next-line no-console
    console.log('Swap To Text Input Focused');
  };

  const handleToAmountChange = (value: string) => {
    swapFormDispatch({
      payload: {
        type: SwapFormActions.SET_SWAP_TO_AMOUNT,
        swapToAmount: value,
      },
    });
  };

  return (
    <Box>
      <Box sx={headingStyle}>
        <Heading size="xSmall">{staticText.to.label}</Heading>
        <Body sx={toHeadingBodyStyle} size="small">
          {swapValuesText.fromToConversion}
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
        onTextInputChange={(value) => handleToAmountChange(value)}
        onTextInputBlur={(value) => handleToAmountValidation(value)}
        onSelectChange={handleToTokenChange}
        textInputErrorMessage={swapToAmountError}
        selectErrorMessage={swapToTokenError}
      />
    </Box>
  );
}

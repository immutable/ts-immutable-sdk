import {
  Box, Heading, Body, OptionKey,
} from '@biom3/react';
import { useCallback, useContext, useMemo } from 'react';
import { SelectInput } from '../../../../components/FormComponents/SelectInput/SelectInput';
import { amountInputValidation } from '../../../../lib/validations/amountInputValidations';
import { SwapFormActions, SwapFormContext } from '../../context/swap-form-context/SwapFormContext';
import { headingStyle, toHeadingBodyStyle } from './SwapFormStyles';
import { SwapWidgetViews } from '../../../../context/view-context/SwapViewContextTypes';
import { text } from '../../../../resources/text/textConfig';
import { SelectOption } from '../../../../components/FormComponents/SelectForm/SelectForm';
import { SwapContext } from '../../context/swap-context/SwapContext';
import { ValidateAmount } from '../../functions/SwapValidator';

interface ToProps {
  debounceTime: number;
  debounce: (func: () => {}, threshold: number) => void;
}

export function To({ debounceTime, debounce }: ToProps) {
  const { swapState } = useContext(SwapContext);
  const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  const {
    swapFromToken, swapToAmount, swapToTokenError, swapToAmountError,
  } = swapFormState;
  const { allowedTokens } = swapState;
  const { swapForm } = text.views[SwapWidgetViews.SWAP];
  const fromToConversionText = '1 WETH ≈ 12.6 GOG'; // TODO: to calculate when dex integrated

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
    [allowedTokens, swapFormDispatch],
  );

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
        onTextInputBlur={() => {
          const validateToAmountError = ValidateAmount(swapToAmount);
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
        }}
        textInputMaxButtonClick={() => {
          // eslint-disable-next-line no-console
          console.log('todo: implement max button function');
        }}
        onSelectChange={handleToTokenChange}
        textInputErrorMessage={swapToAmountError}
        selectErrorMessage={swapToTokenError}
      />
    </Box>
  );
}

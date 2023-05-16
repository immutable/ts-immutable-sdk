import { useCallback, useContext, useMemo } from 'react';
import { SelectInput } from '../../../../components/FormComponents/SelectInput/SelectInput';
import { amountInputValidation } from '../../../../lib/validations/amountInputValidations';
import {
  SwapFormActions,
  SwapFormContext,
} from '../../context/swap-form-context/SwapFormContext';
import { Body, Box, Heading, OptionKey } from '@biom3/react';
import {
  SwapFormContainerStyle,
  ToHeadingBodyStyle,
  HeadingStyle,
} from './SwapFormStyles';
import { text } from '../../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../../context/view-context/SwapViewContextTypes';
import { SwapContext } from '../../context/swap-context/SwapContext';
import { SelectOption } from '../../../../components/FormComponents/SelectForm/SelectForm';

const SWAP_TEXT_INPUT_PLACEHOLDER = '0';

export const SwapForm = () => {
  const { swapState } = useContext(SwapContext);
  const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  const { swapForm } = text.views[SwapWidgetViews.SWAP];
  const { swapFromAmount, swapToAmount } = swapFormState;
  const { tokenBalances, allowedTokens } = swapState;

  const fromTokensOptions = useMemo(() => {
    return tokenBalances.map(
      (tokenBalance) =>
        ({
          id: `${tokenBalance.token.symbol}-${tokenBalance.token.name}`,
          label: tokenBalance.token.symbol,
          icon: tokenBalance.token.icon, // todo: add correct image once available on token info
        } as SelectOption)
    );
  }, [tokenBalances]);

  const toTokenOptions = useMemo(() => {
    return allowedTokens.map(
      (token) =>
        ({
          id: `${token.symbol}-${token.name}`,
          label: token.symbol,
          icon: undefined, // todo: add correct image once available on token info
        } as SelectOption)
    );
  }, [allowedTokens]);

  // extract these to context or calculate on render
  const fromToConversionText = '1 WETH ≈ 12.6 GOG'; // TODO: to calculate when dex integrated
  const fromFiatPriceText = 'Approx USD $20.40';
  const availableFromBalanceSubtext = 'Available 0.123';

  const handleFromTokenChange = useCallback(
    (value: OptionKey) => {
      const selectedTokenOption = tokenBalances.find(
        (tokenBalance) =>
          value === `${tokenBalance.token.symbol}-${tokenBalance.token.name}`
      );

      if (selectedTokenOption && selectedTokenOption.token) {
        swapFormDispatch({
          payload: {
            type: SwapFormActions.SET_SWAP_FROM_TOKEN,
            swapFromToken: selectedTokenOption.token,
          },
        });
      }
    },
    [tokenBalances, swapFormDispatch]
  );

  const handleToTokenChange = useCallback(
    (value: OptionKey) => {
      const selectedTokenOption = allowedTokens.find(
        (token) => value === `${token.symbol}-${token.name}`
      );

      if (selectedTokenOption) {
        swapFormDispatch({
          payload: {
            type: SwapFormActions.SET_SWAP_TO_TOKEN,
            swapToToken: selectedTokenOption,
          },
        });
      }
    },
    [allowedTokens, swapFormDispatch]
  );

  return (
    <Box sx={SwapFormContainerStyle}>
      <Box>
        <Heading size="xSmall" sx={HeadingStyle}>
          {swapForm.from.label}
        </Heading>
        <SelectInput
          selectId="select-from"
          textInputId="text-input-from"
          options={fromTokensOptions}
          selectSubtext={availableFromBalanceSubtext}
          selectTextAlign="left"
          textInputValue={swapFromAmount}
          textInputPlaceholder={SWAP_TEXT_INPUT_PLACEHOLDER}
          textInputSubtext={fromFiatPriceText}
          textInputTextAlign="right"
          textInputValidator={amountInputValidation}
          onTextInputFocus={() => console.log('Swap From Text Input Focused')}
          onTextInputChange={(swapFromAmount) => {
            console.log('Swap From Amount onChange');
            console.log(swapFromAmount);
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_SWAP_FROM_AMOUNT,
                swapFromAmount,
              },
            });
          }}
          onTextInputBlur={(swapFromAmount: string) => {
            console.log('Swap From Amount onBlur');
          }}
          textInputMaxButtonClick={() => {
            console.log('todo: implement max button function');
          }}
          onSelectChange={handleFromTokenChange}
        />
      </Box>
      <Box>
        {/* todo, add the converstion label thats right aligned */}
        <Box sx={HeadingStyle}>
          <Heading size="xSmall">{swapForm.to.label}</Heading>
          <Body sx={ToHeadingBodyStyle} size="small">
            {fromToConversionText}
          </Body>
        </Box>
        <SelectInput
          selectId="select-to"
          textInputId="text-input-to"
          options={toTokenOptions}
          textInputValue={swapToAmount}
          textInputPlaceholder={SWAP_TEXT_INPUT_PLACEHOLDER}
          textInputTextAlign="right"
          textInputValidator={amountInputValidation}
          onTextInputFocus={() => console.log('Swap To Text Input Focused')}
          onTextInputChange={(swapToAmount) => {
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_SWAP_TO_AMOUNT,
                swapToAmount,
              },
            });
          }}
          onTextInputBlur={(swapToAmount: string) => {
            console.log('Swap To Amount onBlur');
          }}
          textInputMaxButtonClick={() => {
            console.log('todo: implement max button function');
          }}
          onSelectChange={handleToTokenChange}
        />
      </Box>
    </Box>
  );
};

import { useContext } from 'react';
import { SelectInput } from '../../../../components/FormComponents/SelectInput/SelectInput';
import { amountInputValidation } from '../../../../lib/validations/amountInputValidations';
import {
  SwapFormActions,
  SwapFormContext,
} from '../../context/swap-form-context/SwapFormContext';
import { Body, Box, Heading } from '@biom3/react';
import {
  SwapFormContainerStyle,
  ToHeadingBodyStyle,
  HeadingStyle,
} from './SwapFormStyles';
import { text } from '../../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../../context/view-context/SwapViewContextTypes';

export const SwapForm = () => {
  const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  const { swapForm } = text.views[SwapWidgetViews.SWAP];
  const { swapFromAmount, swapToAmount } = swapFormState;

  // extract these to context or calculate on render
  const fromToConversionText = '1 WETH ≈ 12.6 GOG'; // TODO: to calculate when dex integrated
  const fromFiatPriceText = 'Approx USD $20.40';
  const availableFromBalanceSubtext = 'Available 0.123';

  const toFiatPriceText = 'Approx USD $20.40';

  return (
    <Box sx={SwapFormContainerStyle}>
      <Box>
        <Heading size="xSmall" sx={HeadingStyle}>
          {swapForm.from.label}
        </Heading>
        <SelectInput
          options={[
            // todo: get values from token balances
            {
              id: 'ETH',
              label: 'Ethereum',
              icon: 'EthToken',
              boldVariant: true,
            },
            {
              id: 'IMX',
              label: 'Immutable X',
              icon: 'ImxTokenDex',
              boldVariant: true,
            },
          ]}
          selectSubtext={availableFromBalanceSubtext} // todo: fix hardcoding
          selectTextAlign="left"
          textInputValue={swapFromAmount}
          textInputPlaceholder="0"
          textInputSubtext={fromFiatPriceText} // todo: fix hardcoding
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
            console.log(swapFromAmount);
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_SWAP_FROM_AMOUNT,
                swapFromAmount,
              },
            });
          }}
          textInputMaxButtonClick={() => {
            console.log('todo: implement max button function');
          }}
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
          options={[
            // todo: get from allowed tokens
            {
              id: 'ETH',
              label: 'Ethereum',
              icon: 'EthToken',
              boldVariant: true,
            },
            {
              id: 'IMX',
              label: 'Immutable X',
              icon: 'ImxTokenDex',
              boldVariant: true,
            },
          ]}
          textInputValue={swapToAmount}
          textInputPlaceholder="0"
          textInputSubtext={toFiatPriceText}
          textInputTextAlign="right"
          textInputValidator={amountInputValidation}
          onTextInputFocus={() => console.log('Swap To Text Input Focused')}
          onTextInputChange={(swapToAmount) => {
            console.log('Swap To Amount onChange');
            console.log(swapToAmount);
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_SWAP_TO_AMOUNT,
                swapToAmount,
              },
            });
          }}
          onTextInputBlur={(swapToAmount: string) => {
            console.log('Swap To Amount onBlur');
            console.log(swapToAmount);
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_SWAP_TO_AMOUNT,
                swapToAmount,
              },
            });
          }}
          textInputMaxButtonClick={() => {
            console.log('todo: implement max button function');
          }}
        />
      </Box>
    </Box>
  );
};

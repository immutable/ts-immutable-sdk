import { useContext } from 'react';
import { SelectInput } from '../../../../components/FormComponents/SelectInput/SelectInput';
import { amountInputValidation } from '../../../../lib/validations/amountInputValidations';
import {
  SwapFormActions,
  SwapFormContext,
} from '../../context/swap-form-context/SwapFormContext';
import { Body, Box, Heading } from '@biom3/react';
import { ToHeadingBodyStyle, ToHeadingStyle, ToStyle } from './SwapFormStyles';

export const SwapForm = () => {
  const { swapFormDispatch } = useContext(SwapFormContext);

  return (
    <>
      <Box>
        <Heading size="xSmall">From</Heading>
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
          textInputSubtext="Approx USD $20.40" // todo: fix hardcoding
          textInputTextAlign="right"
          selectSubtext="0.123 Available" // todo: fix hardcoding
          selectTextAlign="left"
          textInputValidator={amountInputValidation}
          onTextInputBlur={(swapTo: string) => {
            console.log(swapTo);
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_SWAP_TO,
                swapTo,
              },
            });
          }}
          textInputMaxButtonClick={() => {
            console.log('todo: implement max button function');
          }}
        />
      </Box>
      <Box sx={ToStyle}>
        {/* todo, add the converstion label thats right aligned */}
        <Box sx={ToHeadingStyle}>
          <Heading size="xSmall">To</Heading>
          <Body sx={ToHeadingBodyStyle} size="small">
            {/* todo: fix hardcoding */}1 WETH ≈ 12.6 GOG
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
          textInputSubtext="Approx USD $20.40" // todo: fix hardcoding
          textInputTextAlign="right"
          textInputValidator={amountInputValidation}
          onTextInputBlur={(swapToAmount: string) => {
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
    </>
  );
};

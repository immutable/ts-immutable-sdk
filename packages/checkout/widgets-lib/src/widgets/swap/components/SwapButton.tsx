import { Box, Button } from '@biom3/react';
import { useContext } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sendSwapSuccessEvent } from '../SwapWidgetEvents';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import {
  ViewContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ViewActions,
} from '../../../context/view-context/ViewContext';
import { SwapContext } from '../context/swap-context/SwapContext';
import {
  swapButtonBoxStyle,
  swapButtonIconLoadingStyle,
} from './SwapButtonStyles';
// import { SwapFormActions, SwapFormContext } from '../context/swap-form-context/SwapFormContext';
// import {
//   ValidateFromToken, ValidateFromAmount, ValidateToToken, ValidateToAmount,
// } from '../functions/SwapValidator';

export interface SwapButtonProps {
  loading: boolean
  validator: () => boolean
}

export function SwapButton({ loading, validator }: SwapButtonProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { viewDispatch } = useContext(ViewContext);
  const { swapState } = useContext(SwapContext);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { checkout, provider } = swapState;
  const { buttonText } = text.views[SwapWidgetViews.SWAP].swapForm;
  // const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  // const {
  //   swapFromToken,
  //   swapFromAmount,
  //   swapToToken,
  //   swapToAmount,
  // } = swapFormState;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const SwapFormValidator = (): boolean => {
  //   const validateFromTokenError = ValidateFromToken(swapFromToken);
  //   const validateFromAmountError = ValidateFromAmount(swapFromAmount, swapFromToken?.formattedBalance);
  //   const validateToTokenError = ValidateToToken(swapToToken);

  //   // we are expecting this to have an amount input from the quote
  //   // conversely if the user updates this then swapFromAmount should have a quote value
  //   // before we allow the swap to occur.
  //   // This will be handled in swap slice 2.
  //   const validateToAmountError = ValidateToAmount(swapToAmount);

  //   if (validateFromTokenError) {
  //     swapFormDispatch({
  //       payload: {
  //         type: SwapFormActions.SET_SWAP_FROM_TOKEN_ERROR,
  //         swapFromTokenError: validateFromTokenError,
  //       },
  //     });
  //   }

  //   if (validateFromAmountError) {
  //     swapFormDispatch({
  //       payload: {
  //         type: SwapFormActions.SET_SWAP_FROM_AMOUNT_ERROR,
  //         swapFromAmountError: validateFromAmountError,
  //       },
  //     });
  //   }

  //   if (validateToTokenError) {
  //     swapFormDispatch({
  //       payload: {
  //         type: SwapFormActions.SET_SWAP_TO_TOKEN_ERROR,
  //         swapToTokenError: validateToTokenError,
  //       },
  //     });
  //   }

  //   if (validateToAmountError) {
  //     swapFormDispatch({
  //       payload: {
  //         type: SwapFormActions.SET_SWAP_TO_AMOUNT_ERROR,
  //         swapToAmountError: validateToAmountError,
  //       },
  //     });
  //   }

  //   if (
  //     validateFromTokenError
  //     || validateFromAmountError
  //     || validateToTokenError
  //     || validateToAmountError) return false;
  //   return true;
  // };

  const sendTransaction = async () => {
    if (!checkout || !provider) return;
    if (!validator()) return;
    try {
      await checkout.sendTransaction({
        provider,
        transaction: {
          nonce: '0x00',
          gasPrice: '0x00',
          gas: '0x00',
          to: '',
          from: '',
          value: '0x00',
          data: '',
          chainId: 5,
        },
      });
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: SwapWidgetViews.SUCCESS },
        },
      });
    } catch (err: any) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: SwapWidgetViews.SUCCESS },
        },
      });
    }
  };

  return (
    <Box sx={swapButtonBoxStyle}>
      <Button
        testId="swap-button"
        disabled={loading}
        variant="primary"
        onClick={sendTransaction}
        size="large"
      >
        {loading ? (
          <Button.Icon icon="Loading" sx={swapButtonIconLoadingStyle} />
        ) : buttonText}
      </Button>
    </Box>
  );
}

/* eslint-disable */
import { Box, Button } from '@biom3/react';
import { Transaction } from '@imtbl/checkout-sdk';
import { useContext } from 'react';
import { sendSwapSuccessEvent } from '../../SwapWidgetEvents';
import { text } from '../../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../../context/view-context/SwapViewContextTypes';
import {
  ViewContext,
  ViewActions,
} from '../../../../context/view-context/ViewContext';
import { SwapContext } from '../../context/swap-context/SwapContext';
import {
  swapButtonBoxStyle,
  swapButtonIconLoadingStyle,
} from './SwapButtonStyles';
import { SwapFormActions, SwapFormContext } from '../../context/swap-form-context/SwapFormContext';
import {
  ValidateFromToken, ValidateFromAmount, ValidateToToken, ValidateToAmount,
} from '../../functions/SwapValidator';

export interface SwapButtonProps {
  loading: boolean
}

export function SwapButton(props: SwapButtonProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { swapState } = useContext(SwapContext);
  const { checkout, provider } = swapState;

  const { loading } = props;

  const { buttonText } = text.views[SwapWidgetViews.SWAP].swapForm;
  const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  const {
    swapFromToken, swapFromAmount, swapToToken, swapToAmount,
  } = swapFormState;

  const SwapFormValidator = (): boolean => {
    const validateFromTokenError = ValidateFromToken(swapFromToken);
    const validateFromAmountError = ValidateFromAmount(swapFromAmount, swapFromToken?.formattedBalance);
    const validateToTokenError = ValidateToToken(swapToToken);

    // we are expecting this to have an amount input from the quote
    // conversely if the user updates this then swapFromAmount should have a quote value
    // before we allow the swap to occur.
    // This will be handled in swap slice 2.
    const validateToAmountError = ValidateToAmount(swapToAmount);

    if (validateFromTokenError) {
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_FROM_TOKEN_ERROR,
          swapFromTokenError: validateFromTokenError,
        },
      });
    }

    if (validateFromAmountError) {
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_FROM_AMOUNT_ERROR,
          swapFromAmountError: validateFromAmountError,
        },
      });
    }

    if (validateToTokenError) {
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_TO_TOKEN_ERROR,
          swapToTokenError: validateToTokenError,
        },
      });
    }

    if (validateToAmountError) {
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_TO_AMOUNT_ERROR,
          swapToAmountError: validateToAmountError,
        },
      });
    }

    if (
      validateFromTokenError
      || validateFromAmountError
      || validateToTokenError
      || validateToAmountError) return false;
    return true;
  };

  const sendTransaction = async () => {
  };

  return (
    <Box sx={swapButtonBoxStyle}>
      <Button
        testId="swap-button"
        disabled={loading}
        variant={loading ? 'tertiary' : 'primary'}
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

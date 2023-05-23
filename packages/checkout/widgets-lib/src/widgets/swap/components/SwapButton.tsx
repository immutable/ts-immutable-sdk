import { Box, Button } from '@biom3/react';
import { useContext } from 'react';
import { TransactionResponse } from '@imtbl/dex-sdk';
import { Transaction } from '@imtbl/checkout-sdk';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sendSwapSuccessEvent } from '../SwapWidgetEvents';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import {
  ViewContext,
  ViewActions,
} from '../../../context/view-context/ViewContext';
import { SwapContext } from '../context/swap-context/SwapContext';
import {
  swapButtonBoxStyle,
  swapButtonIconLoadingStyle,
} from './SwapButtonStyles';

export interface SwapButtonProps {
  loading: boolean
  validator: () => boolean
  quote: TransactionResponse | null
}

export function SwapButton({ loading, validator, quote }: SwapButtonProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { swapState } = useContext(SwapContext);
  const { checkout, provider } = swapState;
  const { buttonText } = text.views[SwapWidgetViews.SWAP].swapForm;

  const sendTransaction = async () => {
    if (!checkout || !provider || !quote) return;
    if (!validator()) return;
    try {
      await checkout.sendTransaction({
        provider,
        transaction: quote.transaction as Transaction, // todo: our checkout Transaction requires fields that are not required on a ethers transaction request
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

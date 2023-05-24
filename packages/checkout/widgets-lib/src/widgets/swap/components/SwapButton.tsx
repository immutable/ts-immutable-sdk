import { Box, Button } from '@biom3/react';
import { useContext } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sendSwapSuccessEvent } from '../SwapWidgetEvents';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import {
  ViewContext,
  ViewActions,
  BaseViews,
} from '../../../context/view-context/ViewContext';
import { SwapContext } from '../context/swapContext';
import {
  swapButtonBoxStyle,
  swapButtonIconLoadingStyle,
} from './SwapButtonStyles';

export interface SwapButtonProps {
  loading: boolean
  validator: () => boolean
}

export function SwapButton({ loading, validator }: SwapButtonProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { swapState } = useContext(SwapContext);
  const { checkout, provider } = swapState;
  const { buttonText } = text.views[SwapWidgetViews.SWAP].swapForm;

  const sendTransaction = async () => {
    if (!validator()) return;
    if (!checkout || !provider) return;
    try {
      // await checkout.sendTransaction({
      //   provider,
      //   transaction: // todo: send the transaction
      // });
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
          view: {
            type: BaseViews.ERROR,
            error: err,
          },
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

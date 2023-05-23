import { Box, Button } from '@biom3/react';
import { useContext } from 'react';
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
}

export function SwapButton({ loading, validator }: SwapButtonProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { swapState } = useContext(SwapContext);
  const { checkout, provider } = swapState;
  const { buttonText } = text.views[SwapWidgetViews.SWAP].swapForm;

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

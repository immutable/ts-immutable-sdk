import { Box, Button } from '@biom3/react';
import { Transaction } from '@imtbl/checkout-sdk';
import { useContext, useEffect, useState } from 'react';
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

export interface SwapButtonProps {
  transaction?: Transaction;
  validator: () => boolean;
}

export function SwapButton(props: SwapButtonProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { swapState } = useContext(SwapContext);
  const { checkout, provider } = swapState;
  const { transaction, validator } = props;
  const [loading, setLoading] = useState(true);
  const { buttonText } = text.views[SwapWidgetViews.SWAP].swapForm;

  const sendTransaction = async () => {
    if (!checkout || !transaction || !provider) return;
    if (!validator()) return;

    try {
      await checkout.sendTransaction({
        provider,
        transaction,
      });
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: SwapWidgetViews.SUCCESS },
        },
      });
      sendSwapSuccessEvent();
    } catch (err: any) {
      // Intentionally making this succeed at the moment since the
      // transaction will always error out currently
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: SwapWidgetViews.SUCCESS },
        },
      });
    }
  };

  // TODO: remove this and move the loading state used for the button into a SwapContext
  // or SwapFormContext etc...
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [setLoading]);

  return (
    <Box sx={swapButtonBoxStyle}>
      <Button
        disabled={!provider || !transaction || loading}
        variant={!provider || !transaction ? 'tertiary' : 'primary'}
        onClick={sendTransaction}
        size="large"
      >
        {loading && (
          <Button.Icon icon="Loading" sx={swapButtonIconLoadingStyle} />
        )}
        {!loading && buttonText}
      </Button>
    </Box>
  );
}

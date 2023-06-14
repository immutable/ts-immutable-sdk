import { TransactionResponse } from '@ethersproject/providers';
import { useContext, useEffect } from 'react';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import {
  PrefilledSwapForm,
  SwapWidgetViews,
} from '../../../context/view-context/SwapViewContextTypes';
import { LoadingView } from '../../../views/loading/LoadingView';
import { text } from '../../../resources/text/textConfig';

interface SwapInProgressProps {
  transactionResponse: TransactionResponse;
  swapForm: PrefilledSwapForm;
}

export function SwapInProgress({ transactionResponse, swapForm }: SwapInProgressProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { IN_PROGRESS: { loading } } = text.views[SwapWidgetViews.SWAP];

  useEffect(() => {
    (async () => {
      try {
        const receipt = await transactionResponse.wait();

        if (receipt.status === 1) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: { type: SwapWidgetViews.SUCCESS },
            },
          });
          return;
        }

        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SwapWidgetViews.FAIL,
              data: swapForm,
              reason: 'Transaction failed',
            },
          },
        });
      } catch (e) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SwapWidgetViews.FAIL,
              data: swapForm,
              reason: 'Transaction failed',
            },
          },
        });
      }
    })();
  }, [transactionResponse]);

  return (
    <LoadingView loadingText={loading.text} />
  );
}

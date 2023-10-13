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
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

interface SwapInProgressProps {
  transactionResponse: TransactionResponse;
  swapForm: PrefilledSwapForm;
}

export function SwapInProgress({ transactionResponse, swapForm }: SwapInProgressProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { IN_PROGRESS: { loading } } = text.views[SwapWidgetViews.SWAP];

  const { page } = useAnalytics();

  // TODO: review how to capture this event specifically for Approve Spending and then Approve Transaction
  useEffect(() => {
    page({
      userJourney: UserJourney.SWAP,
      screen: 'SwapInProgress',
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const receipt = await transactionResponse.wait();

        if (receipt.status === 1) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: SwapWidgetViews.SUCCESS,
                data: {
                  transactionHash: receipt.transactionHash,
                },
              },
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
      } catch {
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
    <LoadingView loadingText={loading.text} showFooterLogo />
  );
}

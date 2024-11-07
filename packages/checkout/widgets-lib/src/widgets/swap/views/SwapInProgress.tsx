import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import {
  PrefilledSwapForm,
  SwapWidgetViews,
} from '../../../context/view-context/SwapViewContextTypes';
import { LoadingView } from '../../../views/loading/LoadingView';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { TransactionResponse } from 'ethers';

interface SwapInProgressProps {
  transactionResponse: TransactionResponse;
  swapForm: PrefilledSwapForm;
}

export function SwapInProgress({
  transactionResponse,
  swapForm,
}: SwapInProgressProps) {
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);

  const { page } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.SWAP,
      screen: 'SwapInProgress',
      extras: {
        swapFormInfo: swapForm,
      },
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const receipt = await transactionResponse.wait();

        if (receipt?.status === 1) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: SwapWidgetViews.SUCCESS,
                data: {
                  fromTokenAddress: swapForm.fromTokenAddress,
                  fromAmount: swapForm.fromAmount,
                  toTokenAddress: swapForm.toTokenAddress,
                  toAmount: swapForm.toAmount || '',
                  transactionHash: receipt?.hash,
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
    <LoadingView loadingText={t('views.SWAP.IN_PROGRESS.loading.text')} />
  );
}

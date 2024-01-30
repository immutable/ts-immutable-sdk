import { TransactionResponse } from '@ethersproject/providers';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { ViewActions, ViewContext } from 'context/view-context/ViewContext';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { LoadingView } from 'views/loading/LoadingView';

interface ClaimWithdrawalInProgressProps {
  transactionResponse: TransactionResponse;
}

export function ClaimWithdrawalInProgress({ transactionResponse }: ClaimWithdrawalInProgressProps) {
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);

  const { page } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.BRIDGE,
      screen: 'ClaimWithdrawalInProgress',
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
                type: BridgeWidgetViews.CLAIM_WITHDRAWAL_SUCCESS,
                transactionHash: receipt.transactionHash,
              },
            },
          });
          return;
        }

        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: BridgeWidgetViews.CLAIM_WITHDRAWAL_FAILURE,
              reason: 'Transaction failed',
            },
          },
        });
      } catch {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: BridgeWidgetViews.CLAIM_WITHDRAWAL_FAILURE,
              reason: 'Transaction failed',
            },
          },
        });
      }
    })();
  }, [transactionResponse]);

  return <LoadingView loadingText={t('views.CLAIM_WITHDRAWAL.IN_PROGRESS.loading.text')} showFooterLogo />;
}

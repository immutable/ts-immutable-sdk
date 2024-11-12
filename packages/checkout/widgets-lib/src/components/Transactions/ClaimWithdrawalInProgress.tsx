import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TransactionResponse } from 'ethers';
import { UserJourney, useAnalytics } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { ViewActions, ViewContext } from '../../context/view-context/ViewContext';
import { BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';
import { LoadingView } from '../../views/loading/LoadingView';

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
    if (!transactionResponse) return;

    (async () => {
      try {
        const receipt = await transactionResponse.wait();

        if (receipt?.status === 1) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: BridgeWidgetViews.CLAIM_WITHDRAWAL_SUCCESS,
                transactionHash: receipt.hash,
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
              transactionHash: receipt?.hash ?? '',
              reason: 'Transaction failed',
            },
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: BridgeWidgetViews.CLAIM_WITHDRAWAL_FAILURE,
              transactionHash: '',
              reason: 'Transaction failed',
            },
          },
        });
      }
    })();
  }, [transactionResponse]);

  return <LoadingView loadingText={t('views.CLAIM_WITHDRAWAL.IN_PROGRESS.loading.text')} />;
}

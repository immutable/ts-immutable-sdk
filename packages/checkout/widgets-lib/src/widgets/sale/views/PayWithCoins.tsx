import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleContext } from '../context/SaleContextProvider';
import { LoadingView } from '../../../views/loading/LoadingView';
import { useSaleEvent } from '../hooks/useSaleEvents';

export function PayWithCoins() {
  const { t } = useTranslation();
  const processing = useRef(false);
  const {
    sendPageView,
    sendTransactionSuccessEvent,
    sendFailedEvent,
    sendCloseEvent,
    sendSuccessEvent,
  } = useSaleEvent();
  const {
    execute, signResponse, executeResponse, signTokenIds,
  } = useSaleContext();
  const executedTxns = executeResponse?.transactions.length || 0;

  let loadingText = [
    t('views.PAYMENT_METHODS.loading.ready1'),
    t('views.PAYMENT_METHODS.loading.ready2'),
    t('views.PAYMENT_METHODS.loading.ready3'),
  ];

  if (executedTxns >= 1) {
    loadingText = [
      t('views.PAYMENT_METHODS.loading.processing1'),
      t('views.PAYMENT_METHODS.loading.processing2'),
      t('views.PAYMENT_METHODS.loading.processing3'),
    ];
  }

  const sendTransaction = async () => {
    execute(
      signResponse,
      (txn) => {
        sendTransactionSuccessEvent(txn); // not an analytics event
      },
      (error, txns) => {
        const details = {
          transactionId: signResponse?.transactionId,
          errorType: error?.type,
        };
        sendFailedEvent(String(error?.data?.error), error, txns, undefined, details); // checkoutPrimarySalePaymentMethods_FailEventFailed
      },
    );
  };

  useEffect(() => {
    if (signResponse !== undefined && processing.current === false) {
      processing.current = true;
      sendTransaction();
    }
  }, [signResponse]);

  useEffect(() => {
    if (executeResponse?.done === true) {
      const details = { transactionId: signResponse?.transactionId };
      sendSuccessEvent(SaleWidgetViews.SALE_SUCCESS, executeResponse?.transactions, signTokenIds, details); // checkoutPrimarySaleSaleSuccess_SuccessEventSucceeded
      sendCloseEvent(SaleWidgetViews.SALE_SUCCESS); // checkoutPrimarySaleSaleSuccess_CloseButtonPressed
    }
  }, [executeResponse]);

  useEffect(() => sendPageView(SaleWidgetViews.PAY_WITH_COINS), []); // checkoutPrimarySalePayWithCoinsViewed

  return <LoadingView loadingText={loadingText} />;
}

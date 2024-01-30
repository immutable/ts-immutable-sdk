import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleContext } from '../context/SaleContextProvider';
import { LoadingView } from '../../../views/loading/LoadingView';
import { useSaleEvent } from '../hooks/useSaleEvents';

export function PayWithCoins() {
  const { t } = useTranslation();
  const processing = useRef(false);
  const { sendPageView, sendTransactionSuccessEvent, sendFailedEvent } = useSaleEvent();
  const {
    execute, signResponse, executeResponse, goToSuccessView,
  } = useSaleContext();
  const expectedTxns = signResponse?.transactions.length || 0;
  const executedTxns = executeResponse?.transactions.length || 0;

  let loadingText = t('views.PAYMENT_METHODS.loading.ready');

  if (signResponse !== undefined) {
    loadingText = t('views.PAYMENT_METHODS.loading.confirm');
  } else if (executedTxns > 0 && executedTxns === expectedTxns) {
    loadingText = t('views.PAYMENT_METHODS.loading.processing');
  }

  if (signResponse !== undefined) {
    loadingText = `${loadingText} ${executedTxns}/${expectedTxns}`;
  }

  const sendTransaction = async () => {
    execute(
      signResponse,
      (txn) => {
        sendTransactionSuccessEvent(txn);
      },
      (error, txns) => {
        sendFailedEvent(error.toString(), error, txns);
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
      goToSuccessView();
    }
  }, [executeResponse]);

  useEffect(() => sendPageView(SaleWidgetViews.PAY_WITH_COINS), []);

  return <LoadingView loadingText={loadingText} showFooterLogo />;
}

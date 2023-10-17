import { useEffect, useRef } from 'react';

import { text as textConfig } from '../../../resources/text/textConfig';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleContext } from '../context/SaleContextProvider';
import { LoadingView } from '../../../views/loading/LoadingView';
import { useSaleEvent } from '../hooks/useSaleEvents';

export function PayWithCoins() {
  const processing = useRef(false);
  const text = textConfig.views[SaleWidgetViews.PAYMENT_METHODS];
  const { sendTransactionSuccessEvent } = useSaleEvent();
  const {
    execute, signResponse, executeResponse, goToSuccessView,
  } = useSaleContext();
  const expectedTxns = signResponse?.transactions.length || 0;
  const executedTxns = executeResponse?.transactions.length || 0;

  let loadingText = text.loading.ready;

  if (signResponse !== undefined) {
    loadingText = text.loading.confirm;
  } else if (executedTxns > 0 && executedTxns === expectedTxns) {
    loadingText = text.loading.processing;
  }

  if (signResponse !== undefined) {
    loadingText = `${loadingText} ${executedTxns}/${expectedTxns}`;
  }

  const sendTransaction = async () => {
    const transactions = await execute(signResponse);
    if (transactions.length !== expectedTxns) {
      sendTransactionSuccessEvent(transactions);
    }
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

  return <LoadingView loadingText={loadingText} showFooterLogo />;
}

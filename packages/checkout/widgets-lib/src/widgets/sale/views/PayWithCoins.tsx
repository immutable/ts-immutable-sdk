import {
  useContext, useEffect, useRef,
} from 'react';

import { text as textConfig } from '../../../resources/text/textConfig';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleContext } from '../context/SaleContextProvider';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import { sendSaleFailedEvent, sendSaleSuccessEvent } from '../SaleWidgetEvents';

export function PayWithCoins() {
  const processing = useRef(false);
  const text = textConfig.views[SaleWidgetViews.PAYMENT_METHODS];

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
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
      sendSaleFailedEvent(eventTarget, 'Transactions failed to execute');
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
      sendSaleSuccessEvent(eventTarget, executeResponse);
      goToSuccessView();
    }
  }, [executeResponse]);

  return <LoadingView loadingText={loadingText} showFooterLogo />;
}

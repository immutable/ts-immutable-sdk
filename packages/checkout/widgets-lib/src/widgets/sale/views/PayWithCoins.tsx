import {
  useContext, useEffect, useRef, useState,
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
  const [loading, setLoading] = useState<string>(text.loading.ready);

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const {
    execute, signResponse, executeResponse, goToSuccessView,
  } = useSaleContext();
  const expectedTxns = signResponse?.transactions.length || 0;

  const sendTransaction = async () => {
    const transactions = await execute(signResponse);
    if (transactions.length !== expectedTxns) {
      sendSaleFailedEvent(eventTarget, 'Transactions failed to execute');
    }
  };

  useEffect(() => {
    if (signResponse !== undefined && processing.current === false) {
      processing.current = true;
      setLoading(text.loading.confirm);
      sendTransaction();
    }
  }, [signResponse]);

  useEffect(() => {
    if (executeResponse?.transactions.length === expectedTxns) {
      setLoading(text.loading.processing);
    }

    if (executeResponse?.done === true) {
      sendSaleSuccessEvent(eventTarget, executeResponse);
      goToSuccessView();
    }
  }, [executeResponse]);

  return <LoadingView loadingText={loading} showFooterLogo />;
}

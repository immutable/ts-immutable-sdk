import { useCallback, useEffect, useRef } from 'react';
// import { useTranslation } from 'react-i18next';
import { Heading } from '@biom3/react';
import { getRemoteImage } from 'lib/utils';
import { Environment } from '@imtbl/config';
import { useHandover } from 'lib/hooks/useHandover';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleContext } from '../context/SaleContextProvider';
import { useSaleEvent } from '../hooks/useSaleEvents';

export function PayWithCoins() {
  // const { t } = useTranslation();
  const processing = useRef(false);
  const {
    sendPageView,
    sendTransactionSuccessEvent,
    sendFailedEvent,
    sendCloseEvent,
    sendSuccessEvent,
  } = useSaleEvent();
  const {
    executeAll, signResponse, executeResponse, signTokenIds,
  } = useSaleContext();

  const { addHandover } = useHandover({ id: HandoverTarget.GLOBAL });

  const onBeforeApproveCallback = useCallback(() => {
    setTimeout(() => {
      addHandover({
        animationUrl: getRemoteImage(
          Environment.SANDBOX,
          '/approve-handover.riv',
        ),
        children: (
          <Heading>Waiting for you to approve access to your coins</Heading>
        ),
      });
    }, 0);
  }, [addHandover]);

  const onAfterApproveCallback = useCallback(() => {
    setTimeout(() => {
      addHandover({
        animationUrl: getRemoteImage(
          Environment.SANDBOX,
          '/approve-handover.riv',
        ),
        children: <Heading>Coins ready for item purchase</Heading>,
      });
    }, 0);
  }, [addHandover]);

  const onBeforeExecuteCallback = useCallback(() => {
    setTimeout(() => {
      addHandover({
        animationUrl: getRemoteImage(
          Environment.SANDBOX,
          '/execute-handover.riv',
        ),
        children: <Heading>Finalising your order </Heading>,
      });
    }, 0);
  }, [addHandover]);

  const onAfterExecuteCallback = useCallback(() => {
    setTimeout(() => {
      addHandover({
        animationUrl: getRemoteImage(
          Environment.SANDBOX,
          '/execute-handover.riv',
        ),
        children: <Heading>Processing purchase</Heading>,
      });
    }, 0);
  }, [addHandover]);

  const sendTransaction = async () => {
    executeAll(
      signResponse,
      (txn) => {
        sendTransactionSuccessEvent(txn); // not an analytics event
      },
      (error, txns) => {
        const details = { transactionId: signResponse?.transactionId };
        sendFailedEvent(error.toString(), error, txns, undefined, details); // checkoutPrimarySalePaymentMethods_FailEventFailed
      },
    );
  };

  useEffect(() => {
    if (signResponse !== undefined && processing.current === false) {
      processing.current = true;

      addHandover({
        animationUrl: getRemoteImage(Environment.SANDBOX, '/handover.riv'),
        children: (
          <Heading sx={{ px: 'base.spacing.x6' }}>Preparing Order</Heading>
        ),
      });

      sendTransaction();
    }
  }, [signResponse]);

  useEffect(() => {
    if (executeResponse?.done === true) {
      const details = { transactionId: signResponse?.transactionId };
      sendSuccessEvent(
        SaleWidgetViews.SALE_SUCCESS,
        executeResponse?.transactions,
        signTokenIds,
        details,
      ); // checkoutPrimarySaleSaleSuccess_SuccessEventSucceeded
      sendCloseEvent(SaleWidgetViews.SALE_SUCCESS); // checkoutPrimarySaleSaleSuccess_CloseButtonPressed
      console.log('@@@ sale success', executeResponse);
    }
  }, [executeResponse]);

  useEffect(() => sendPageView(SaleWidgetViews.PAY_WITH_COINS), []); // checkoutPrimarySalePayWithCoinsViewed

  // return <LoadingView loadingText={loadingText} />;
  return null;
}

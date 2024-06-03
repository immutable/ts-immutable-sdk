import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from '@biom3/react';
import { getRemoteImage } from 'lib/utils';
import { useHandover } from 'lib/hooks/useHandover';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleContext } from '../context/SaleContextProvider';
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
    executeAll,
    signResponse,
    executeResponse,
    signTokenIds,
    environment,
  } = useSaleContext();

  const { addHandover } = useHandover({ id: HandoverTarget.GLOBAL });

  const onBeforeApproveCallback = useCallback(() => {
    addHandover({
      animationUrl: getRemoteImage(environment, '/approve-handover.riv'),
      children: (
        <Heading>{t('views.PAYMENT_METHODS.handover.beforeApprove')}</Heading>
      ),
    });
  }, [addHandover]);

  const onAfterApproveCallback = useCallback(() => {
    addHandover({
      animationUrl: getRemoteImage(environment, '/approve-handover.riv'),
      children: (
        <Heading>{t('views.PAYMENT_METHODS.handover.afterApprove')}</Heading>
      ),
    });
  }, [addHandover]);

  const onBeforeExecuteCallback = useCallback(() => {
    addHandover({
      animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
      children: (
        <Heading>{t('views.PAYMENT_METHODS.handover.beforeExecute')}</Heading>
      ),
    });
  }, [addHandover]);

  const onAfterExecuteCallback = useCallback(() => {
    addHandover({
      animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
      children: (
        <Heading>{t('views.PAYMENT_METHODS.handover.afterApprove')}</Heading>
      ),
    });
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
        animationUrl: getRemoteImage(environment, '/handover.riv'),
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

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import { useHandover } from 'lib/hooks/useHandover';
import { getRemoteImage } from 'lib/utils';
import { Heading } from '@biom3/react';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleContext } from '../context/SaleContextProvider';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { ExecuteTransactionStep } from '../types';

enum TransactionMethod {
  APPROVE = 'approve(address spender,uint256 amount)',
  // eslint-disable-next-line max-len
  EXECUTE = 'execute(address multicallSigner, bytes32 reference, address[] targets, bytes[] data, uint256 deadline, bytes signature)',
}

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

  const { addHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  const onTxnStep = (method: string, step: ExecuteTransactionStep) => {
    const key = `${method}-${step}`;

    switch (key) {
      case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.BEFORE}`:
        addHandover({
          animationUrl: getRemoteImage(environment, '/approve-handover.riv'),
          children: (
            <Heading>
              {t('views.PAYMENT_METHODS.handover.beforeApprove')}
            </Heading>
          ),
        });
        break;
      case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.AFTER}`:
        addHandover({
          animationUrl: getRemoteImage(environment, '/approve-handover.riv'),
          children: (
            <Heading>
              {t('views.PAYMENT_METHODS.handover.afterApprove')}
            </Heading>
          ),
        });
        break;
      case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.BEFORE}`:
        addHandover({
          animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
          children: (
            <Heading>
              {t('views.PAYMENT_METHODS.handover.beforeExecute')}
            </Heading>
          ),
        });
        break;
      case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.AFTER}`:
        addHandover({
          duration: 2000,
          animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
          children: (
            <Heading>
              {t('views.PAYMENT_METHODS.handover.afterExecute')}
            </Heading>
          ),
        });

        addHandover({
          duration: 2000,
          animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
          children: (
            <Heading>{t('views.PAYMENT_METHODS.handover.success')}</Heading>
          ),
        });
        break;
      default:
        console.error(
          'Unknown TransactionMethod and ExecuteTransactionStep combination',
        );
    }
  };

  const sendTransaction = async () => {
    executeAll(
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
      onTxnStep,
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
      setTimeout(() => {
        sendSuccessEvent(
          SaleWidgetViews.SALE_SUCCESS,
          executeResponse?.transactions,
          signTokenIds,
          details,
        ); // checkoutPrimarySaleSaleSuccess_SuccessEventSucceeded
        sendCloseEvent(SaleWidgetViews.SALE_SUCCESS); // checkoutPrimarySaleSaleSuccess_CloseButtonPressed
      }, 4000);
    }
  }, [executeResponse]);

  useEffect(() => sendPageView(SaleWidgetViews.PAY_WITH_COINS), []); // checkoutPrimarySalePayWithCoinsViewed

  useEffect(
    () => addHandover({
      animationUrl: getRemoteImage(environment, '/handover.riv'),
      animationName: 'Start',
      children: (
        <Heading sx={{ px: 'base.spacing.x6' }}>
          {t('views.PAYMENT_METHODS.handover.initial')}
        </Heading>
      ),
    }),
    [environment],
  );
  return null;
}

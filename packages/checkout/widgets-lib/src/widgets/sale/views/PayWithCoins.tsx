import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef } from 'react';
import { Heading } from '@biom3/react';

import { useSaleContext } from '../context/SaleContextProvider';
import { SaleErrorTypes } from '../types';
import { useSaleEvent } from '../hooks/useSaleEvents';
import {
  StateMachineInput,
  TransactionMethod,
  getRiveAnimationName,
  useHandoverSteps,
} from '../hooks/useHandoverSteps';
import { useHandover } from '../../../lib/hooks/useHandover';
import { HandoverTarget } from '../../../context/handover-context/HandoverContext';
import { HandoverContent } from '../../../components/Handover/HandoverContent';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { isPassportProvider } from '../../../lib/provider';
import { getRemoteRive } from '../../../lib/utils';
import { HandoverDuration } from '../../../context/handover-context/HandoverProvider';

interface StepConfig {
  headingTextKey: string;
  animationUrl: string;
  inputValue: number;
  ctaButtonTextKey?: string;
}

const initateExecuteNextTransactionHandover: Record<
TransactionMethod,
StepConfig
> = {
  [TransactionMethod.APPROVE]: {
    headingTextKey:
      'views.PAYMENT_METHODS.handover.approve.beforeWithCta.heading',
    ctaButtonTextKey:
      'views.PAYMENT_METHODS.handover.approve.beforeWithCta.ctaButton',

    animationUrl: getRiveAnimationName(TransactionMethod.APPROVE),
    inputValue: StateMachineInput.WAITING,
  },
  [TransactionMethod.EXECUTE]: {
    headingTextKey:
      'views.PAYMENT_METHODS.handover.execute.beforeWithCta.heading',
    ctaButtonTextKey:
      'views.PAYMENT_METHODS.handover.execute.beforeWithCta.ctaButton',
    animationUrl: getRiveAnimationName(TransactionMethod.EXECUTE),
    inputValue: StateMachineInput.START,
  },
};

export function PayWithCoins() {
  const processing = useRef(false);
  const prevTransactionIndexRef = useRef<number | null>(null);

  const { t } = useTranslation();
  const {
    sendPageView,
    sendTransactionSuccessEvent,
    sendFailedEvent,
    sendCloseEvent,
    sendSuccessEvent,
  } = useSaleEvent();

  const {
    executeAll,
    executeNextTransaction,
    signResponse,
    filteredTransactions,
    currentTransactionIndex,
    executeResponse,
    signTokenIds,
    environment,
    provider,
    goToErrorView,
  } = useSaleContext();

  const { onTxnStepExecuteNextTransaction, onTxnStepExecuteAll } = useHandoverSteps(environment);

  const { addHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  const executeAllTransactions = useCallback(async () => {
    executeAll(
      signResponse,
      (txn) => {
        sendTransactionSuccessEvent(txn); // not an analytics event
      },
      (error, txns) => {
        const details = { transactionId: signResponse?.transactionId };
        sendFailedEvent(error.toString(), error, txns, undefined, details); // checkoutPrimarySalePaymentMethods_FailEventFailed
        goToErrorView(error.type, error.data);
      },
      onTxnStepExecuteAll,
    );
  }, [signResponse, environment]);

  const executeUserInitiatedTransaction = useCallback(() => {
    const transaction = filteredTransactions[currentTransactionIndex];

    const config = initateExecuteNextTransactionHandover[transaction.methodCall];

    const headingTextBefore = t(config.headingTextKey) || '';
    const ctaButtonTextBefore = t(config.ctaButtonTextKey) || '';

    const handleTransaction = () => {
      try {
        executeNextTransaction(
          (txn) => {
            sendTransactionSuccessEvent(txn);
          },
          (err, txns) => {
            const details = {
              transactionId: signResponse?.transactionId,
            };
            sendFailedEvent(err.toString(), err, txns, undefined, details); // checkoutPrimarySalePaymentMethods_FailEventFailed
            goToErrorView(err.type, err.data);
          },
          onTxnStepExecuteNextTransaction,
        );
      } catch (error) {
        goToErrorView(SaleErrorTypes.SERVICE_BREAKDOWN, { error });
      }
    };

    addHandover({
      animationUrl: getRemoteRive(environment, config.animationUrl),
      inputValue: config.inputValue,
      children: (
        <HandoverContent
          headingText={headingTextBefore}
          primaryButtonText={ctaButtonTextBefore}
          onPrimaryButtonClick={handleTransaction}
        />
      ),
    });
  }, [
    filteredTransactions,
    currentTransactionIndex,
    signResponse,
    environment,
  ]);

  useEffect(() => sendPageView(SaleWidgetViews.PAY_WITH_COINS), []); // checkoutPrimarySalePayWithCoinsViewed

  useEffect(() => {
    if (!provider || filteredTransactions.length === 0) return;

    const hadPendingTransactions = currentTransactionIndex < filteredTransactions.length
      && prevTransactionIndexRef.current !== currentTransactionIndex;

    if (isPassportProvider(provider) && hadPendingTransactions) {
      prevTransactionIndexRef.current = currentTransactionIndex;
      executeUserInitiatedTransaction();
    }
  }, [filteredTransactions, currentTransactionIndex, provider]);

  useEffect(() => {
    if (!signResponse || !provider || processing.current) return;

    if (!isPassportProvider(provider)) {
      processing.current = true;
      executeAllTransactions();
    }
  }, [signResponse, provider]);

  useEffect(() => {
    if (executeResponse?.done) {
      const details = { transactionId: signResponse?.transactionId };

      addHandover({
        duration: HandoverDuration.MEDIUM,
        animationUrl: getRemoteRive(
          environment,
          getRiveAnimationName(TransactionMethod.EXECUTE),
        ),
        inputValue: StateMachineInput.COMPLETED,
        children: (
          <Heading sx={{ px: 'base.spacing.x6' }}>
            {t('views.PAYMENT_METHODS.handover.success')}
          </Heading>
        ),
        onClose: () => {
          sendSuccessEvent(
            SaleWidgetViews.SALE_SUCCESS,
            executeResponse?.transactions,
            signTokenIds,
            details,
          ); // checkoutPrimarySaleSaleSuccess_SuccessEventSucceeded
          sendCloseEvent(SaleWidgetViews.SALE_SUCCESS); // checkoutPrimarySaleSaleSuccess_CloseButtonPressed
        },
      });
    }
  }, [executeResponse]);

  return null;
}

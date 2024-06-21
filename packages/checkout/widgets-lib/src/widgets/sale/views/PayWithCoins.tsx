import { useHandover } from 'lib/hooks/useHandover';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef } from 'react';
import { getRemoteRive } from 'lib/utils';
import { Heading } from '@biom3/react';
import { SaleWidgetViews } from 'context/view-context/SaleViewContextTypes';
import { isPassportProvider } from 'lib/provider';
import { HandoverContent } from 'components/Handover/HandoverContent';

import { useSaleContext } from '../context/SaleContextProvider';
import { ExecuteTransactionStep, SaleErrorTypes } from '../types';
import { useSaleEvent } from '../hooks/useSaleEvents';
import {
  TransactionMethod,
  getRiveAnimationName,
  useHandoverSteps,
} from '../hooks/useHandoverSteps';

interface StepConfig {
  headingTextKey: string;
  animationUrl: string;
  animationName: string;
  ctaButtonTextKey?: string;
}

type ExecuteNextTransactionTextsConfig = {
  [key in ExecuteTransactionStep]: StepConfig;
};

const executeNextTransactionTexts: Record<
TransactionMethod,
ExecuteNextTransactionTextsConfig
> = {
  [TransactionMethod.APPROVE]: {
    [ExecuteTransactionStep.BEFORE]: {
      headingTextKey:
        'views.PAYMENT_METHODS.handover.approve.beforeWithCta.heading',
      ctaButtonTextKey:
        'views.PAYMENT_METHODS.handover.approve.beforeWithCta.ctaButton',

      animationUrl: getRiveAnimationName(TransactionMethod.APPROVE),
      animationName: 'Start',
    },
    [ExecuteTransactionStep.PENDING]: {
      headingTextKey: 'views.PAYMENT_METHODS.handover.approve.pending',
      animationUrl: getRiveAnimationName(TransactionMethod.APPROVE),
      animationName: 'Waiting',
    },
    [ExecuteTransactionStep.AFTER]: {
      headingTextKey: 'views.PAYMENT_METHODS.handover.approve.after',
      animationUrl: getRiveAnimationName(TransactionMethod.APPROVE),
      animationName: 'Processing',
    },
  },
  [TransactionMethod.EXECUTE]: {
    [ExecuteTransactionStep.BEFORE]: {
      headingTextKey:
        'views.PAYMENT_METHODS.handover.execute.beforeWithCta.heading',
      ctaButtonTextKey:
        'views.PAYMENT_METHODS.handover.execute.beforeWithCta.ctaButton',
      animationUrl: getRiveAnimationName(TransactionMethod.EXECUTE),
      animationName: 'Start',
    },
    [ExecuteTransactionStep.PENDING]: {
      headingTextKey: 'views.PAYMENT_METHODS.handover.execute.pending',
      animationUrl: getRiveAnimationName(TransactionMethod.EXECUTE),
      animationName: 'Waiting',
    },
    [ExecuteTransactionStep.AFTER]: {
      headingTextKey: 'views.PAYMENT_METHODS.handover.execute.after',
      animationUrl: getRiveAnimationName(TransactionMethod.EXECUTE),
      animationName: 'Processing',
    },
  },
};

export function PayWithCoins() {
  const handoverAdded = useRef(false);
  const processing = useRef(false);

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

  const { addHandover, closeHandover } = useHandover({
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
      },
      onTxnStepExecuteAll,
    );
  }, [signResponse, environment]);

  const executeUserInitiatedTransaction = useCallback(() => {
    if (handoverAdded.current) return;
    handoverAdded.current = true;

    const transaction = filteredTransactions[currentTransactionIndex];

    const config = executeNextTransactionTexts[transaction.methodCall];

    const headingTextBefore = t(config.before.headingTextKey) || '';
    const ctaButtonTextBefore = t(config.before.ctaButtonTextKey) || '';

    const headingTextPending = t(config.pending.headingTextKey) || '';

    const handleTransaction = () => {
      addHandover({
        animationUrl: getRemoteRive(environment, config.pending.animationUrl),
        animationName: config.pending.animationName,
        children: <Heading>{headingTextPending}</Heading>,
      });

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
          },
          onTxnStepExecuteNextTransaction,
        );
      } catch (error) {
        closeHandover(HandoverTarget.GLOBAL);
        goToErrorView(SaleErrorTypes.SERVICE_BREAKDOWN, { error });
      }
    };

    addHandover({
      animationUrl: getRemoteRive(environment, config.before.animationUrl),
      animationName: config.before.animationName,
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

    if (isPassportProvider(provider)) {
      if (currentTransactionIndex < filteredTransactions.length) {
        executeUserInitiatedTransaction();
      }
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

      sendSuccessEvent(
        SaleWidgetViews.SALE_SUCCESS,
        executeResponse?.transactions,
        signTokenIds,
        details,
      ); // checkoutPrimarySaleSaleSuccess_SuccessEventSucceeded

      addHandover({
        duration: 2000,
        animationUrl: getRemoteRive(
          environment,
          getRiveAnimationName(TransactionMethod.EXECUTE),
        ),
        animationName: 'Completed',
        children: (
          <Heading sx={{ px: 'base.spacing.x6' }}>
            {t('views.PAYMENT_METHODS.handover.success')}
          </Heading>
        ),
        onClose: () => sendCloseEvent(SaleWidgetViews.SALE_SUCCESS), // checkoutPrimarySaleSaleSuccess_CloseButtonPressed
      });
    }
  }, [executeResponse]);

  return null;
}

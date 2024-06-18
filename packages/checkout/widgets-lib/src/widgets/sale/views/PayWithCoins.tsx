import { useHandover } from 'lib/hooks/useHandover';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef } from 'react';
import { getRemoteImage } from 'lib/utils';
import { Heading } from '@biom3/react';
import { SaleWidgetViews } from 'context/view-context/SaleViewContextTypes';
import { isPassportProvider } from 'lib/provider';
import { HandoverContent } from 'components/Handover/HandoverContent';

import { useSaleContext } from '../context/SaleContextProvider';
import { ExecuteTransactionStep, SaleErrorTypes } from '../types';
import { useSaleEvent } from '../hooks/useSaleEvents';

enum TransactionMethod {
  APPROVE = 'approve(address spender,uint256 amount)',
  // eslint-disable-next-line max-len
  EXECUTE = 'execute(address multicallSigner, bytes32 reference, address[] targets, bytes[] data, uint256 deadline, bytes signature)',
}

const executeNextTransactionTexts = {
  [TransactionMethod.APPROVE]: {
    before: {
      headingTextKey:
        'views.PAYMENT_METHODS.handover.approve.beforeWithCta.heading',
      ctaButtonTextKey:
        'views.PAYMENT_METHODS.handover.approve.beforeWithCta.ctaButton',

      animationUrl: '/approve-handover.riv',
      animationName: 'Start',
    },
    after: {
      headingTextKey: 'views.PAYMENT_METHODS.handover.approve.after',
      animationUrl: '/approve-handover.riv',
      animationName: 'Handover',
    },
  },
  [TransactionMethod.EXECUTE]: {
    before: {
      headingTextKey:
        'views.PAYMENT_METHODS.handover.execute.beforeWithCta.heading',
      ctaButtonTextKey:
        'views.PAYMENT_METHODS.handover.execute.beforeWithCta.ctaButton',
      animationUrl: '/execute-handover.riv',
      animationName: 'Start',
    },
    after: {
      headingTextKey: 'views.PAYMENT_METHODS.handover.execute.after',
      animationUrl: '/execute-handover.riv',
      animationName: 'Handover',
    },
  },
};

export function PayWithCoins() {
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

  const { addHandover, closeHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  const onTxnStepExecuteAll = useCallback(
    (method: string, step: ExecuteTransactionStep) => {
      const key = `${method}-${step}`;
      switch (key) {
        case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.BEFORE}`:
          addHandover({
            animationUrl: getRemoteImage(environment, '/approve-handover.riv'),
            animationName: 'Start',
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.approve.before')}
              </Heading>
            ),
          });
          break;
        case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.AFTER}`:
          addHandover({
            animationUrl: getRemoteImage(environment, '/approve-handover.riv'),
            animationName: 'Processing',
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.approve.after')}
              </Heading>
            ),
          });
          break;
        case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.BEFORE}`:
          addHandover({
            animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
            animationName: 'Start',
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.execute.before')}
              </Heading>
            ),
          });
          break;

        case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.AFTER}`:
          addHandover({
            duration: 2000,
            animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
            animationName: 'Handover',
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.execute.after')}
              </Heading>
            ),
          });
          break;

        default:
      }
    },
    [environment, addHandover, t],
  );

  const onTxnStepExecuteNextTransaction = useCallback(
    (method: string, step: ExecuteTransactionStep) => {
      const key = `${method}-${step}`;
      switch (key) {
        case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.AFTER}`:
          addHandover({
            animationUrl: getRemoteImage(environment, '/approve-handover.riv'),
            animationName: 'Processing',
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.approve.after')}
              </Heading>
            ),
          });
          break;

        case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.AFTER}`:
          addHandover({
            animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
            animationName: 'Handover',
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.execute.after')}
              </Heading>
            ),
          });
          break;

        default:
      }
    },
    [environment, addHandover, t],
  );

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
    const transaction = filteredTransactions[currentTransactionIndex];

    const config = executeNextTransactionTexts[transaction.methodCall];

    const headingTextBefore = t(config.before.headingTextKey) || '';
    const ctaButtonTextBefore = t(config.before.ctaButtonTextKey) || '';

    const handleTransaction = () => {
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
    };

    addHandover({
      animationUrl: getRemoteImage(environment, config.before.animationUrl),
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

  // Once getting a response from the sign method, start executing transactions
  useEffect(() => {
    if (
      signResponse !== undefined
      && filteredTransactions.length !== 0
      && processing.current === false
    ) {
      processing.current = true;

      if (isPassportProvider(provider)) {
        try {
          executeUserInitiatedTransaction();
        } catch (error) {
          closeHandover(HandoverTarget.GLOBAL);
          goToErrorView(SaleErrorTypes.SERVICE_BREAKDOWN, { error });
        }
      } else {
        executeAllTransactions();
      }
    }
  }, [signResponse, filteredTransactions, provider]);

  useEffect(() => {
    if (!isPassportProvider(provider)) return;
    if (
      currentTransactionIndex < filteredTransactions.length
      && !executeResponse?.done
    ) {
      try {
        executeUserInitiatedTransaction();
      } catch (error) {
        closeHandover(HandoverTarget.GLOBAL);
        goToErrorView(SaleErrorTypes.SERVICE_BREAKDOWN, { error });
      }
    }
  }, [currentTransactionIndex, filteredTransactions, executeResponse]);

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
        animationUrl: getRemoteImage(environment, '/handover.riv'),
        animationName: 'Success',
        children: (
          <Heading sx={{ px: 'base.spacing.x6' }}>
            {t('views.PAYMENT_METHODS.handover.success')}
          </Heading>
        ),
        onClose: () => sendCloseEvent(SaleWidgetViews.SALE_SUCCESS), // checkoutPrimarySaleSaleSuccess_CloseButtonPressed
      });

      sendSuccessEvent();
    }
  }, [executeResponse, signResponse, provider, environment, signTokenIds]);

  return null;
}

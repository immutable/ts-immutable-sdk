/* eslint-disable no-console */
import { useHandover } from 'lib/hooks/useHandover';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import { useTranslation } from 'react-i18next';
import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { getRemoteImage } from 'lib/utils';
import { Heading } from '@biom3/react';
import { SaleWidgetViews } from 'context/view-context/SaleViewContextTypes';
import { isPassportProvider } from 'lib/provider';
import { HandoverContent } from 'components/Handover/HandoverContent';
import { SalePaymentTypes } from '@imtbl/checkout-sdk';

import { useSaleContext } from '../context/SaleContextProvider';
import { ExecuteTransactionStep } from '../types';
import { useSaleEvent } from '../hooks/useSaleEvents';

enum TransactionMethod {
  APPROVE = 'approve(address spender,uint256 amount)',
  // eslint-disable-next-line max-len
  EXECUTE = 'execute(address multicallSigner, bytes32 reference, address[] targets, bytes[] data, uint256 deadline, bytes signature)',
}

const transactionTexts = {
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
    error: {
      headingTextKey: 'views.PAYMENT_METHODS.handover.approve.error.heading',
      ctaButtonTextKey:
        'views.PAYMENT_METHODS.handover.approve.error.primaryButton',
      secondaryButtonTextKey:
        'views.PAYMENT_METHODS.handover.approve.error.secondaryButton',
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
    error: {
      headingTextKey: 'views.PAYMENT_METHODS.handover.execute.error.heading',
      ctaButtonTextKey:
        'views.PAYMENT_METHODS.handover.execute.error.primaryButton',
      secondaryButtonTextKey:
        'views.PAYMENT_METHODS.handover.execute.error.secondaryButton',
    },
  },
};

export function PayWithCoins() {
  console.log('@@@ PayWithTokens');
  const processing = useRef(false);
  const [isError, setIsError] = useState(false);

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
    goBackToPaymentMethods,
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
                {t('views.PAYMENT_METHODS.handover.execute.pending')}
              </Heading>
            ),
          });
          break;

        default:
          // eslint-disable-next-line no-console
          console.error(
            'Unknown TransactionMethod and ExecuteTransactionStep combination',
          );
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
        sendFailedEvent(error.toString(), error, txns, undefined, details);
        addHandover({
          animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
          children: (
            <HandoverContent
              headingText={t('views.PAYMENT_METHODS.handover.error.heading')}
              primaryButtonText={t(
                'views.PAYMENT_METHODS.handover.error.primaryButton',
              )}
              onPrimaryButtonClick={() => {
                closeHandover();
                goBackToPaymentMethods(SalePaymentTypes.CRYPTO);
              }}
              secondaryButtonText={t(
                'views.PAYMENT_METHODS.handover.error.secondaryButton',
              )}
              onSecondaryButtonClick={() => {
                closeHandover();
                sendCloseEvent(SaleWidgetViews.SALE_FAIL);
              }}
            />
          ),
        });
      },
      onTxnStepExecuteAll,
    );
  }, [signResponse, environment]);

  const executeUserInitiatedTransaction = useCallback(() => {
    setIsError(false);

    const transaction = filteredTransactions[currentTransactionIndex];

    console.log('@@@ transaction', transaction);
    console.log(
      '@@@ currentTransactionIndex executeUserInitiatedTransaction',
      currentTransactionIndex,
    );

    if (!transaction) return;

    const config = transactionTexts[transaction.methodCall];

    const headingTextBefore = t(config.before.headingTextKey) || '';
    const ctaButtonTextBefore = t(config.before.ctaButtonTextKey) || '';

    const handleTransaction = () => {
      console.log('@@@ handleTransaction');
      executeNextTransaction(
        (txn) => {
          sendTransactionSuccessEvent(txn);
        },
        (err, txns) => {
          const details = {
            transactionId: signResponse?.transactionId,
          };
          sendFailedEvent(err.toString(), err, txns, undefined, details);
          setIsError(true);
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
    executeNextTransaction,
    sendTransactionSuccessEvent,
    sendFailedEvent,
    sendCloseEvent,
  ]);

  useEffect(() => sendPageView(SaleWidgetViews.PAY_WITH_COINS), []); // checkoutPrimarySalePayWithCoinsViewed

  // Initial handover
  useEffect(() => {
    addHandover({
      animationUrl: getRemoteImage(environment, '/handover.riv'),
      animationName: 'Start',
      children: (
        <Heading sx={{ px: 'base.spacing.x6' }}>
          {t('views.PAYMENT_METHODS.handover.initial')}
        </Heading>
      ),
    });
  }, [environment]);

  // Once getting a response from the sign method, start executing transactions
  useEffect(() => {
    if (
      signResponse !== undefined
      && filteredTransactions.length !== 0
      && processing.current === false
    ) {
      processing.current = true;

      if (isPassportProvider(provider)) {
        executeUserInitiatedTransaction();
      } else {
        executeAllTransactions();
      }
    }
  }, [signResponse, filteredTransactions, provider]);

  useEffect(() => {
    console.log('@@@ currentTransactionIndex', currentTransactionIndex);
    if (
      currentTransactionIndex < filteredTransactions.length
      && executeResponse
      && !executeResponse.done
      && isPassportProvider(provider)
    ) {
      executeUserInitiatedTransaction();
    }
  }, [currentTransactionIndex, filteredTransactions, executeResponse]);

  useEffect(() => {
    console.log('@@@ executeResponse', executeResponse);

    if (executeResponse?.done) {
      console.log('@@@ executeResponse done');
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

  useEffect(() => {
    if (isError) {
      const transaction = filteredTransactions[currentTransactionIndex];

      if (!transaction) return;

      const config = transactionTexts[transaction.methodCall];

      const errorHeadingText = t(config.error.headingTextKey) || '';
      const errorButtonCtaText = t(config.error.ctaButtonTextKey) || '';
      const errorSecondaryButtonText = t(config.secondaryButtonTextKey) || '';

      addHandover({
        animationUrl: getRemoteImage(environment, config.animationUrl),
        animationName: config.animationName,
        children: (
          <HandoverContent
            headingText={errorHeadingText}
            primaryButtonText={errorButtonCtaText}
            onPrimaryButtonClick={() => {
              executeUserInitiatedTransaction();
            }}
            secondaryButtonText={errorSecondaryButtonText}
            onSecondaryButtonClick={() => {
              closeHandover();
              sendCloseEvent(SaleWidgetViews.SALE_FAIL);
            }}
          />
        ),
      });
    }
  }, [isError]);

  return null;
}

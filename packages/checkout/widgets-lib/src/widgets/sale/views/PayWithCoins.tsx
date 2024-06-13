import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import { useHandover } from 'lib/hooks/useHandover';
import { getRemoteImage } from 'lib/utils';
import { Box, Button, Heading } from '@biom3/react';
import { isPassportProvider } from 'lib/provider';
import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleContext } from '../context/SaleContextProvider';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { ExecuteTransactionStep, ExecutedTransaction } from '../types';
import { filterAllowedTransactions } from '../functions/signUtils';

enum TransactionMethod {
  APPROVE = 'approve(address spender,uint256 amount)',
  // eslint-disable-next-line max-len
  EXECUTE = 'execute(address multicallSigner, bytes32 reference, address[] targets, bytes[] data, uint256 deadline, bytes signature)',
}

function ErrorHandover({
  headingText,
  buttonCtaText,
  onButtonCtaClick,
  secondaryButtonText,
  onSecondaryButtonClick,
}: {
  headingText: string | undefined;
  buttonCtaText?: string | undefined;
  onButtonCtaClick?: () => void;
  secondaryButtonText?: string | undefined;
  onSecondaryButtonClick?: () => void;
}) {
  console.log(
    '@@@@@@@ ErrorHandover',
    headingText,
    buttonCtaText,
    secondaryButtonText,
  );
  return (
    <>
      <Heading sx={{ paddingBottom: 'base.spacing.x6' }}>{headingText}</Heading>

      {buttonCtaText && onButtonCtaClick && (
        <Box
          sx={{
            paddingX: 'base.spacing.x4',
            paddingBottom: 'base.spacing.x2',
          }}
        >
          <Button
            sx={{ width: '100%' }}
            variant="primary"
            size="large"
            onClick={onButtonCtaClick}
          >
            {buttonCtaText}
          </Button>
        </Box>
      )}

      {secondaryButtonText && onSecondaryButtonClick && (
        <Box
          sx={{
            paddingX: 'base.spacing.x4',
            paddingBottom: 'base.spacing.x4',
          }}
        >
          <Button
            sx={{ width: '100%' }}
            variant="tertiary"
            size="large"
            onClick={onSecondaryButtonClick}
          >
            {secondaryButtonText}
          </Button>
        </Box>
      )}
    </>
  );
}

function HandoverWithCta({
  headingText,
  ctaButtonText,
  errorHeadingText,
  errorButtonCtaText,
  errorSecondaryButtonText,
  onSecondaryButtonClick,
  executeNextTransaction,
  signResponse,
  environment,
  sendTransactionSuccessEvent,
  sendFailedEvent,
  addHandover,
}: {
  headingText?: string;
  ctaButtonText?: string;
  errorHeadingText?: string;
  errorButtonCtaText?: string;
  errorSecondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
  executeNextTransaction: (
    onTxnSuccess: (txn: ExecutedTransaction) => void,
    onTxnError: (error: any, txns: ExecutedTransaction[]) => void
  ) => Promise<boolean>;
  signResponse: any;
  environment: any;
  sendTransactionSuccessEvent: (txn: ExecutedTransaction) => void;
  sendFailedEvent: (
    error: string,
    err: any,
    txns: any,
    undefined?: any,
    details?: any
  ) => void;
  addHandover: (handover: any) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  console.log(
    '@@@@@@@ HandoverWithCta',
    headingText,
    ctaButtonText,
    errorHeadingText,
    errorButtonCtaText,
    errorSecondaryButtonText,
  );

  const handleRetry = () => {
    executeNextTransaction(
      (txn) => {
        sendTransactionSuccessEvent(txn);
        setError(null);
      },
      (err, txns) => {
        const details = {
          transactionId: signResponse?.transactionId,
        };
        sendFailedEvent(err.toString(), err, txns, undefined, details); // checkoutPrimarySalePaymentMethods_FailEventFailed
        setError('Unable to send transaction');
      },
    );
  };

  const handleTransaction = () => {
    executeNextTransaction(
      (txn) => {
        sendTransactionSuccessEvent(txn);
        setError(null);
      },
      (err, txns) => {
        const details = {
          transactionId: signResponse?.transactionId,
        };
        sendFailedEvent(err.toString(), err, txns, undefined, details); // checkoutPrimarySalePaymentMethods_FailEventFailed
        setError('Unable to send transaction');

        addHandover({
          animationUrl: getRemoteImage(environment, '/approve-handover.riv'),
          children: (
            <ErrorHandover
              headingText={errorHeadingText}
              buttonCtaText={errorButtonCtaText}
              onButtonCtaClick={handleRetry}
              secondaryButtonText={errorSecondaryButtonText}
              onSecondaryButtonClick={onSecondaryButtonClick}
            />
          ),
        });
      },
    );
  };

  return (
    <>
      <Heading sx={{ paddingBottom: 'base.spacing.x42' }}>
        {headingText}
      </Heading>
      <Button
        sx={{ width: '100%' }}
        variant="primary"
        size="large"
        onClick={handleTransaction}
      >
        {ctaButtonText}
      </Button>
      {error && (
        <ErrorHandover
          headingText={errorHeadingText}
          buttonCtaText={errorButtonCtaText}
          onButtonCtaClick={handleRetry}
          secondaryButtonText={errorSecondaryButtonText}
          onSecondaryButtonClick={onSecondaryButtonClick}
        />
      )}
    </>
  );
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
    executeNextTransaction,
    signResponse,
    executeResponse,
    signTokenIds,
    environment,
    provider,
    goBackToPaymentMethods,
  } = useSaleContext();

  const { addHandover, closeHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  const onTxnStep = useCallback(
    (method: string, step: ExecuteTransactionStep) => {
      const key = `${method}-${step}`;

      switch (key) {
        case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.BEFORE}`:
          addHandover({
            animationUrl: getRemoteImage(environment, '/approve-handover.riv'),
            animationName: 'Start',
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
            animationName: 'Processing',
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
            animationName: 'Start',
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.beforeApprove')}
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

  const handleExecuteAllTransactionsError = (error, transactions) => {
    const details = { transactionId: signResponse?.transactionId };
    sendFailedEvent(error.toString(), error, transactions, undefined, details);
    addHandover({
      animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
      children: (
        <ErrorHandover
          headingText={t(
            'views.PAYMENT_METHODS.handover.executeAllTxnsError.heading',
          )}
          buttonCtaText={t(
            'views.PAYMENT_METHODS.handover.executeAllTxnsError.primaryButton',
          )}
          onButtonCtaClick={() => {
            closeHandover();
            goBackToPaymentMethods(SalePaymentTypes.CRYPTO);
          }}
          secondaryButtonText={t(
            'views.PAYMENT_METHODS.handover.executeAllTxnsError.secondaryButton',
          )}
          onSecondaryButtonClick={() => {
            closeHandover();
            sendCloseEvent(SaleWidgetViews.SALE_FAIL);
          }}
        />
      ),
    });
  };

  const executeAllTransactions = async () => {
    executeAll(
      signResponse,
      (txn) => {
        sendTransactionSuccessEvent(txn); // not an analytics event
      },
      (error, txns) => handleExecuteAllTransactionsError(error, txns),
      onTxnStep,
    );
  };

  const executeManualTransaction = async () => {
    if (provider && signResponse) {
      const transactions = await filterAllowedTransactions(
        signResponse.transactions,
        provider,
      );

      console.log('@@@@@@ filtered transactions', transactions);

      const firstMethod = transactions[0].methodCall;

      const headingText = firstMethod === TransactionMethod.APPROVE
        ? t('views.PAYMENT_METHODS.handover.beforeApprove')
        : t('views.PAYMENT_METHODS.handover.beforeExecute');
      const ctaButtonText = firstMethod === TransactionMethod.APPROVE
        ? t('views.PAYMENT_METHODS.handover.beforeApproveWithCta.ctaButton')
        : t('views.PAYMENT_METHODS.handover.beforeExecuteWithCta.ctaButton');

      addHandover({
        animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
        children: (
          <HandoverWithCta
            headingText={headingText}
            ctaButtonText={ctaButtonText}
            errorHeadingText={t(
              'views.PAYMENT_METHODS.handover.singleTxnError.heading',
            )}
            errorButtonCtaText={t(
              'views.PAYMENT_METHODS.handover.singleTxnError.primaryButton',
            )}
            errorSecondaryButtonText={t(
              'views.PAYMENT_METHODS.handover.singleTxnError.secondaryButton',
            )}
            onSecondaryButtonClick={() => {
              closeHandover();
              sendCloseEvent(SaleWidgetViews.SALE_FAIL); // checkoutPrimarySaleSaleFail_CloseButtonPressed
            }}
            executeNextTransaction={executeNextTransaction}
            signResponse={signResponse}
            environment={environment}
            sendTransactionSuccessEvent={sendTransactionSuccessEvent}
            sendFailedEvent={sendFailedEvent}
            addHandover={addHandover}
          />
        ),
        animationName: 'Start',
      });
    }
  };

  useEffect(() => {
    if (signResponse !== undefined && processing.current === false) {
      processing.current = true;

      if (!isPassportProvider(provider)) {
        executeAllTransactions();
      } else {
        executeManualTransaction();
      }
    }
  }, [signResponse, provider]);

  useEffect(() => {
    console.log('@@@@@@@ executeResponse', executeResponse);
    if (
      isPassportProvider(provider)
      && executeResponse?.transactions?.length === 1
      && executeResponse?.transactions?.find(
        (transaction) => transaction.method === TransactionMethod.APPROVE,
      )
    ) {
      addHandover({
        animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
        children: (
          <Heading>{t('views.PAYMENT_METHODS.handover.afterApprove')}</Heading>
        ),
        duration: 2000,
      });

      addHandover({
        animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
        children: (
          <HandoverWithCta
            headingText={t('views.PAYMENT_METHODS.handover.beforeExecute')}
            ctaButtonText={t(
              'views.PAYMENT_METHODS.handover.beforeExecuteWithCta.ctaButton',
            )}
            errorHeadingText={t(
              'views.PAYMENT_METHODS.handover.singleTxnError.heading',
            )}
            errorButtonCtaText={t(
              'views.PAYMENT_METHODS.handover.singleTxnError.primaryButton',
            )}
            errorSecondaryButtonText={t(
              'views.PAYMENT_METHODS.handover.singleTxnError.secondaryButton',
            )}
            onSecondaryButtonClick={() => {
              closeHandover();
              sendCloseEvent(SaleWidgetViews.SALE_FAIL); // checkoutPrimarySaleSaleFail_CloseButtonPressed
            }}
            executeNextTransaction={executeNextTransaction}
            signResponse={signResponse}
            environment={environment}
            sendTransactionSuccessEvent={sendTransactionSuccessEvent}
            sendFailedEvent={sendFailedEvent}
            addHandover={addHandover}
          />
        ),
      });
    }

    if (executeResponse?.done === true) {
      const details = { transactionId: signResponse?.transactionId };

      sendSuccessEvent(
        SaleWidgetViews.SALE_SUCCESS,
        executeResponse?.transactions,
        signTokenIds,
        details,
      ); // checkoutPrimarySaleSaleSuccess_SuccessEventSucceeded

      addHandover({
        duration: 2000,
        animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
        animationName: 'Handover',
        children: (
          <Heading>{t('views.PAYMENT_METHODS.handover.afterExecute')}</Heading>
        ),
      });
      addHandover({
        duration: 2000,
        animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
        animationName: 'Success',
        children: (
          <Heading>{t('views.PAYMENT_METHODS.handover.success')}</Heading>
        ),
        onClose: () => sendCloseEvent(SaleWidgetViews.SALE_SUCCESS), // checkoutPrimarySaleSaleSuccess_CloseButtonPressed
      });
    }
  }, [executeResponse, provider, signResponse]);

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

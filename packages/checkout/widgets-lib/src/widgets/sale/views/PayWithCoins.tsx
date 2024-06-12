import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import { useHandover } from 'lib/hooks/useHandover';
import { getRemoteImage } from 'lib/utils';
import { Button, Heading } from '@biom3/react';
import { isPassportProvider } from 'lib/provider';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleContext } from '../context/SaleContextProvider';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { ExecuteTransactionStep, SignedTransaction } from '../types';

enum TransactionMethod {
  APPROVE = 'approve(address spender,uint256 amount)',
  // eslint-disable-next-line max-len
  EXECUTE = 'execute(address multicallSigner, bytes32 reference, address[] targets, bytes[] data, uint256 deadline, bytes signature)',
}

const findTransactionByMethodCall = (
  transactions: SignedTransaction[],
  methodCall: string,
): SignedTransaction | undefined => transactions.find((transaction) => transaction.methodCall === methodCall);

const getHandoverContent = (
  t,
  executeTransaction,
  signResponse,
  sendTransactionSuccessEvent,
  sendFailedEvent,
) => {
  const approveTxn = signResponse
    ? findTransactionByMethodCall(
      signResponse.transactions,
      TransactionMethod.APPROVE,
    )
    : undefined;
  const executeTxn = signResponse
    ? findTransactionByMethodCall(
      signResponse.transactions,
      TransactionMethod.EXECUTE,
    )
    : undefined;
  return {
    beforeApproveWithCta: (
      <>
        <Heading>
          TIME TO APPROVE
          {t('views.PAYMENT_METHODS.handover.beforeApproveWithCta.heading')}
        </Heading>
        <Button
          onClick={() => executeTransaction(
            approveTxn,
            (txn) => sendTransactionSuccessEvent(txn),
            (error, txns) => {
              const details = { transactionId: signResponse?.transactionId };
              sendFailedEvent(
                error.toString(),
                error,
                txns,
                undefined,
                details,
              );
            },
          )}
        >
          {t('views.PAYMENT_METHODS.handover.beforeApproveWithCta.ctaButton')}
        </Button>
      </>
    ),
    beforeApprove: (
      <Heading>{t('views.PAYMENT_METHODS.handover.beforeApprove')}</Heading>
    ),
    afterApprove: (
      <Heading>{t('views.PAYMENT_METHODS.handover.afterApprove')}</Heading>
    ),
    beforeExecuteWithCta: (
      <>
        <Heading>
          TIME TO EXECUTE
          {t('views.PAYMENT_METHODS.handover.beforeApproveWithCta.heading')}
        </Heading>
        <Button
          onClick={() => executeTransaction(
            executeTxn,
            (txn) => sendTransactionSuccessEvent(txn),
            (error, txns) => {
              const details = { transactionId: signResponse?.transactionId };
              sendFailedEvent(
                error.toString(),
                error,
                txns,
                undefined,
                details,
              );
            },
          )}
        >
          {t('views.PAYMENT_METHODS.handover.beforeApproveWithCta.ctaButton')}
        </Button>
      </>
    ),
    beforeExecute: (
      <Heading>{t('views.PAYMENT_METHODS.handover.beforeApprove')}</Heading>
    ),
    afterExecute: (
      <Heading>{t('views.PAYMENT_METHODS.handover.afterExecute')}</Heading>
    ),
    success: <Heading>{t('views.PAYMENT_METHODS.handover.success')}</Heading>,
  };
};

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
    executeTransaction,
    signResponse,
    executeResponse,
    signTokenIds,
    environment,
    provider,
  } = useSaleContext();

  const { addHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  const handoverContent = getHandoverContent(
    t,
    executeTransaction,
    signResponse,
    sendTransactionSuccessEvent,
    sendFailedEvent,
  );

  const onTxnStep = useCallback(
    (method: string, step: ExecuteTransactionStep) => {
      const key = `${method}-${step}`;
      switch (key) {
        case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.BEFORE}`:
          addHandover({
            animationUrl: getRemoteImage(environment, '/approve-handover.riv'),
            children: handoverContent.beforeApprove,
          });
          break;
        case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.AFTER}`:
          addHandover({
            animationUrl: getRemoteImage(environment, '/approve-handover.riv'),
            children: handoverContent.afterApprove,
          });
          break;
        case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.BEFORE}`:
          addHandover({
            animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
            children: handoverContent.beforeExecute,
          });
          break;
        default:
          // eslint-disable-next-line no-console
          console.error(
            'Unknown TransactionMethod and ExecuteTransactionStep combination',
          );
      }
    },
    [environment, provider, addHandover, handoverContent],
  );

  useEffect(() => {
    if (signResponse !== undefined && processing.current === false) {
      processing.current = true;
      // Execute all transactions one-by-one if the provider is not passport
      // Otherwise, show the handover screen to let the user initate the transaction
      if (!isPassportProvider(provider)) {
        executeAll(
          signResponse,
          (txn) => {
            sendTransactionSuccessEvent(txn); // not an analytics event
          },
          (error, txns) => {
            const details = { transactionId: signResponse?.transactionId };
            sendFailedEvent(error.toString(), error, txns, undefined, details); // checkoutPrimarySalePaymentMethods_FailEventFailed
          },
          onTxnStep,
        );
      } else {
        addHandover({
          animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
          children: handoverContent.beforeApproveWithCta,
        });
      }
    }
  }, [signResponse]);

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
        children: handoverContent.afterApprove,
        duration: 2000,
      });

      addHandover({
        animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
        children: handoverContent.beforeExecuteWithCta,
      });
    }

    if (executeResponse?.transactions?.length === 2) {
      addHandover({
        duration: 2000,
        animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
        children: handoverContent.afterExecute,
      });
      addHandover({
        duration: 2000,
        animationUrl: getRemoteImage(environment, '/execute-handover.riv'),
        children: handoverContent.success,
      });

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

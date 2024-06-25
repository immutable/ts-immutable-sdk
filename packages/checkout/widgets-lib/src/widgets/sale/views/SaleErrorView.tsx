import { BaseTokens } from '@biom3/design-tokens';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { StatusType } from '../../../components/Status/StatusType';
import { SaleErrorTypes } from '../types';
import { useSaleContext } from '../context/SaleContextProvider';
import { sendSaleWidgetCloseEvent } from '../SaleWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { useSaleEvent } from '../hooks/useSaleEvents';
import {
  StateMachineInput,
  TransactionMethod,
  getRiveAnimationName,
  useHandoverSteps,
} from '../hooks/useHandoverSteps';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { getRemoteRive } from '../../../lib/utils';
import { HandoverContent } from '../../../components/Handover/HandoverContent';
import { useMount } from '../../../hooks/useMount';
import { useHandover } from '../../../lib/hooks/useHandover';
import { HandoverTarget } from '../../../context/handover-context/HandoverContext';
import { isPassportProvider } from '../../../lib/provider';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';

interface ErrorHandlerConfig {
  onActionClick?: () => void;
  onSecondaryActionClick?: () => void;
  statusType: StatusType;
  statusIconStyles?: Record<string, string>;
}

type SaleErrorViewProps = {
  biomeTheme: BaseTokens;
  errorType: SaleErrorTypes | undefined;
  transactionHash?: string;
  blockExplorerLink?: string;
};

export function SaleErrorView({
  biomeTheme,
  transactionHash,
  blockExplorerLink,
  errorType,
}: SaleErrorViewProps) {
  const { t } = useTranslation();
  const {
    goBackToPaymentMethods,
    goToErrorView,
    executeNextTransaction,
    signResponse,
    environment,
    provider,
  } = useSaleContext();
  const { sendTransactionSuccessEvent, sendFailedEvent } = useSaleEvent();
  const { viewDispatch } = useContext(ViewContext);
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const { addHandover, closeHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  const { onTxnStepExecuteNextTransaction } = useHandoverSteps(environment);

  const closeWidget = () => {
    sendSaleWidgetCloseEvent(eventTarget);
  };

  const retryLastTransaction = () => {
    try {
      executeNextTransaction(
        (txn) => {
          sendTransactionSuccessEvent(txn);
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: SaleWidgetViews.PAY_WITH_COINS,
              },
            },
          });
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
      goToErrorView(SaleErrorTypes.SERVICE_BREAKDOWN, { error });
    }
  };

  const errorHandlersConfig: Record<SaleErrorTypes, ErrorHandlerConfig> = {
    [SaleErrorTypes.TRANSACTION_FAILED]: {
      onActionClick: () => {
        closeHandover();
        goBackToPaymentMethods();
      },
      onSecondaryActionClick: transactionHash
        ? () => {
          window.open(blockExplorerLink);
        }
        : closeWidget,
      statusType: StatusType.FAILURE,
      statusIconStyles: {
        fill: biomeTheme.color.status.fatal.dim,
      },
    },
    [SaleErrorTypes.SERVICE_BREAKDOWN]: {
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
      statusIconStyles: {
        fill: biomeTheme.color.status.fatal.dim,
      },
    },
    [SaleErrorTypes.PRODUCT_NOT_FOUND]: {
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
      statusIconStyles: {
        fill: biomeTheme.color.status.fatal.dim,
      },
    },
    [SaleErrorTypes.INSUFFICIENT_STOCK]: {
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
      statusIconStyles: {
        fill: biomeTheme.color.status.fatal.dim,
      },
    },
    [SaleErrorTypes.TRANSAK_FAILED]: {
      onActionClick: () => {
        closeHandover();
        goBackToPaymentMethods();
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.WALLET_FAILED]: {
      onActionClick: () => {
        if (isPassportProvider(provider)) {
          retryLastTransaction();
        } else {
          closeHandover();
          goBackToPaymentMethods();
        }
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
      statusIconStyles: {
        fill: biomeTheme.color.status.fatal.dim,
      },
    },
    [SaleErrorTypes.WALLET_REJECTED_NO_FUNDS]: {
      onActionClick: () => {
        closeHandover();
        goBackToPaymentMethods();
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.WALLET_REJECTED]: {
      onActionClick: () => {
        if (isPassportProvider(provider)) {
          retryLastTransaction();
        } else {
          closeHandover();
          goBackToPaymentMethods();
        }
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.WALLET_POPUP_BLOCKED]: {
      onActionClick: () => {
        if (isPassportProvider(provider)) {
          retryLastTransaction();
        } else {
          closeHandover();
          goBackToPaymentMethods();
        }
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.FUNDING_ROUTE_EXECUTE_ERROR]: {
      onActionClick: () => {
        closeHandover();
        goBackToPaymentMethods();
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.INVALID_PARAMETERS]: {
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.ALERT,
      statusIconStyles: {
        fill: biomeTheme.color.status.attention.dim,
        transform: 'none',
      },
    },
    [SaleErrorTypes.DEFAULT]: {
      onActionClick: () => {
        closeHandover();
        goBackToPaymentMethods();
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
  };

  const getErrorViewProps = () => {
    const handlers = errorHandlersConfig[errorType || SaleErrorTypes.DEFAULT] || {};
    const secondaryButtonText = errorType === SaleErrorTypes.TRANSACTION_FAILED && transactionHash
      ? t(`views.SALE_FAIL.errors.${errorType}.secondaryAction`)
      : t(`views.SALE_FAIL.errors.${SaleErrorTypes.DEFAULT}.secondaryAction`);

    return {
      headingText: t('views.PAYMENT_METHODS.handover.error.heading'),
      subheadingText: t(`views.SALE_FAIL.errors.${errorType}.description`),
      primaryButtonText: t(`views.SALE_FAIL.errors.${errorType}.primaryAction`),
      onPrimaryButtonClick: handlers?.onActionClick,
      secondaryButtonText,
      onSecondaryButtonClick: handlers?.onSecondaryActionClick,
    };
  };

  useMount(
    () => {
      if (!environment || !errorType) return;

      addHandover({
        animationUrl: getRemoteRive(
          environment,
          getRiveAnimationName(TransactionMethod.APPROVE),
        ),
        inputValue: StateMachineInput.ERROR,
        children: <HandoverContent {...getErrorViewProps()} />,
      });
    },
    () => Boolean(environment && errorType),
    [errorType, environment],
  );

  return null;
}

import { BaseTokens } from '@biom3/design-tokens';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { StatusType } from '../../../components/Status/StatusType';
import {
  StatusView,
  StatusViewProps,
} from '../../../components/Status/StatusView';
import { SaleErrorTypes } from '../types';
import { useSaleContext } from '../context/SaleContextProvider';
import { sendSaleWidgetCloseEvent } from '../SaleWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';

interface ErrorHandlerConfig {
  onActionClick?: () => void;
  onSecondaryActionClick?: () => void;
  statusType: StatusType;
  statusIconStyles?: Record<string, string>;
}

type SaleErrorViewProps = {
  errorType: SaleErrorTypes | undefined;
  biomeTheme: BaseTokens;
};

export function SaleErrorView({
  errorType = SaleErrorTypes.DEFAULT,
  biomeTheme,
}: SaleErrorViewProps) {
  const { t } = useTranslation();
  const { goBackToPaymentMethods } = useSaleContext();
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const closeWidget = () => {
    sendSaleWidgetCloseEvent(eventTarget);
  };

  const errorHandlersConfig: Record<SaleErrorTypes, ErrorHandlerConfig> = {
    [SaleErrorTypes.TRANSACTION_FAILED]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: () => {
        /* TODO: redirects to Immutascan to check the transaction if has is given */
      },
      statusType: StatusType.FAILURE,
      statusIconStyles: {
        fill: biomeTheme.color.status.destructive.dim,
      },
    },
    [SaleErrorTypes.SERVICE_BREAKDOWN]: {
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
      statusIconStyles: {
        fill: biomeTheme.color.status.fatal.dim,
      },
    },
    [SaleErrorTypes.TRANSAK_FAILED]: {
      onActionClick: () => {
        /* TODO: start over the transak flow */
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.WALLET_FAILED]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
      statusIconStyles: {
        fill: biomeTheme.color.status.fatal.dim,
      },
    },
    [SaleErrorTypes.WALLET_REJECTED_NO_FUNDS]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.WALLET_REJECTED]: {
      onActionClick: () => {
        goBackToPaymentMethods(SalePaymentTypes.CRYPTO);
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.SMART_CHECKOUT_ERROR]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.SMART_CHECKOUT_EXECUTE_ERROR]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.DEFAULT]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
  };

  const getErrorViewProps = (): StatusViewProps => {
    const handlers = errorHandlersConfig[errorType] || {};

    return {
      testId: 'fail-view',
      statusText: t(`views.SALE_FAIL.errors.${errorType}.description`),
      actionText: t(`views.SALE_FAIL.errors.${errorType}.primaryAction`),
      onActionClick: handlers?.onActionClick,
      secondaryActionText: t(
        `views.SALE_FAIL.errors.${errorType}.secondaryAction`,
      ),
      onSecondaryActionClick: handlers?.onSecondaryActionClick,
      onCloseClick: closeWidget,
      statusType: handlers.statusType,
      statusIconStyles: {
        transform: 'rotate(180deg)',
        fill: biomeTheme.color.status.guidance.dim,
        ...handlers.statusIconStyles,
      },
    };
  };
  return <StatusView {...getErrorViewProps()} />;
}

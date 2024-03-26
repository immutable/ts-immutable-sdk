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
  biomeTheme: BaseTokens;
  errorType: SaleErrorTypes | undefined;
  transactionHash?: string;
  blockExplorerLink?: string;
};

export function SaleErrorView({
  biomeTheme,
  transactionHash,
  blockExplorerLink,
  errorType = SaleErrorTypes.DEFAULT,
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
      onSecondaryActionClick: transactionHash
        ? () => {
          window.open(blockExplorerLink);
        }
        : closeWidget,
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
      onActionClick: goBackToPaymentMethods,
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
    [SaleErrorTypes.WALLET_POPUP_BLOCKED]: {
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
    [SaleErrorTypes.INVALID_PARAMETERS]: {
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.ALERT,
      statusIconStyles: {
        fill: biomeTheme.color.status.attention.dim,
        transform: 'none',
      },
    },
    [SaleErrorTypes.DEFAULT]: {
      onActionClick: goBackToPaymentMethods,
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
  };

  const getErrorViewProps = (): StatusViewProps => {
    const handlers = errorHandlersConfig[errorType] || {};
    const secondaryActionText = errorType === SaleErrorTypes.TRANSACTION_FAILED && transactionHash
      ? t(`views.SALE_FAIL.errors.${errorType}.secondaryAction`)
      : t(`views.SALE_FAIL.errors.${SaleErrorTypes.DEFAULT}.secondaryAction`);

    return {
      testId: 'fail-view',
      statusText: t(`views.SALE_FAIL.errors.${errorType}.description`),
      actionText: t(`views.SALE_FAIL.errors.${errorType}.primaryAction`),
      onActionClick: handlers?.onActionClick,
      secondaryActionText,
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

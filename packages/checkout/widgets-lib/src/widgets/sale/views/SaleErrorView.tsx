import { BaseTokens } from '@biom3/design-tokens';
import { useContext } from 'react';
import { StatusType } from '../../../components/Status/StatusType';
import { StatusView, StatusViewProps } from '../../../components/Status/StatusView';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { PaymentTypes, SaleErrorTypes } from '../types';
import { useSaleContext } from '../context/SaleContextProvider';
import { sendSaleWidgetCloseEvent } from '../SaleWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';

interface ErrorHandlerConfig {
  onActionClick?: () => void;
  onSecondaryActionClick?: () => void;
  statusType: StatusType;
  statusIconStyles?: Record<string, string>;
}

interface ErrorTextConfig {
  description: string;
  primaryAction?: string;
  secondaryAction?: string;
}

type AllErrorTextConfigs = Record<SaleErrorTypes, ErrorTextConfig>;

type SaleErrorViewProps = {
  errorType: SaleErrorTypes | undefined,
  biomeTheme: BaseTokens
};

export function SaleErrorView({ errorType = SaleErrorTypes.DEFAULT, biomeTheme }: SaleErrorViewProps) {
  const { goBackToPaymentMethods } = useSaleContext();
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

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
        goBackToPaymentMethods(PaymentTypes.CRYPTO);
      },
      onSecondaryActionClick: closeWidget,
      statusType: StatusType.INFORMATION,
    },
    [SaleErrorTypes.SMART_CHECKOUT_ERROR]: {
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
    const errorTextConfig: AllErrorTextConfigs = text.views[SaleWidgetViews.SALE_FAIL].errors;
    const handlers = errorHandlersConfig[errorType] || {};

    return {
      testId: 'fail-view',
      statusText: errorTextConfig[errorType].description,
      actionText: errorTextConfig[errorType]?.primaryAction,
      onActionClick: handlers?.onActionClick,
      secondaryActionText: errorTextConfig[errorType].secondaryAction,
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
  return (
    <StatusView {...getErrorViewProps()} />
  );
}

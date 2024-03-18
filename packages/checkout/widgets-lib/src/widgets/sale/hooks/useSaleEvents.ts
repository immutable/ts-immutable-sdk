import { useContext } from 'react';
import { StandardAnalyticsActions } from '@imtbl/react-analytics';
import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import {
  UserJourney,
  useAnalytics,
  AnalyticsControlTypes,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import {
  sendSaleFailedEvent,
  sendSaleSuccessEvent,
  sendSaleWidgetCloseEvent,
  sendSaleTransactionSuccessEvent,
  sendSalePaymentMethodEvent,
} from '../SaleWidgetEvents';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { ExecutedTransaction } from '../types';
import { useSaleContext } from '../context/SaleContextProvider';
import { toPascalCase, toStringifyTransactions } from '../functions/utils';

export const useSaleEvent = () => {
  const { track, page } = useAnalytics();
  const {
    recipientAddress: userId,
    recipientEmail: email,
    signResponse,
    paymentMethod,
  } = useSaleContext();
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const defaultView = SaleWidgetViews.PAYMENT_METHODS;
  const commonProps = {
    location: 'web',
    userJourney: UserJourney.SALE,
  };
  const userProps = {
    email,
    userId,
    paymentMethod,
  };
  const orderProps = {
    amount: signResponse?.order.totalAmount,
    currency: signResponse?.order.currency.name,
  };

  const sendCloseEvent = (
    screen: string = defaultView,
    controlType: AnalyticsControlTypes = 'Button',
    action: StandardAnalyticsActions = 'Pressed',
  ) => {
    track({
      ...commonProps,
      screen: toPascalCase(screen),
      control: 'Close',
      controlType,
      action,
      extras: {
        ...userProps,
      },
    });
    sendSaleWidgetCloseEvent(eventTarget);
  };

  const sendSuccessEvent = (
    screen: string = defaultView,
    transactions: ExecutedTransaction[] = [],
    tokenIds: string[] = [],
    details: Record<string, any> = {},
  ) => {
    track({
      ...commonProps,
      screen: toPascalCase(screen),
      control: 'Success',
      controlType: 'Event',
      action: 'Succeeded',
      extras: {
        ...details,
        ...userProps,
        transactions: toStringifyTransactions(transactions),
        ...orderProps,
        paymentMethod,
        tokenIds,
      },
    });
    sendSaleSuccessEvent(eventTarget, paymentMethod, transactions, tokenIds, details.transactionId);
  };

  const sendFailedEvent = (
    reason: string,
    error: Record<string, unknown>,
    transactions: ExecutedTransaction[] = [],
    screen: string = defaultView,
    details: Record<string, any> = {},
  ) => {
    track({
      ...commonProps,
      screen: toPascalCase(screen || defaultView),
      control: 'Fail',
      controlType: 'Event',
      action: 'Failed',
      extras: {
        ...details,
        transactions: toStringifyTransactions(transactions),
        ...error,
        ...orderProps,
        ...userProps,
        paymentMethod,
        reason,
      },
    });
    sendSaleFailedEvent(eventTarget, reason, error, paymentMethod, transactions, details.transactionId);
  };

  const sendTransactionSuccessEvent = (transaction: ExecutedTransaction) => {
    sendSaleTransactionSuccessEvent(eventTarget, paymentMethod, [transaction]);
  };

  const sendSelectedPaymentMethod = (type: SalePaymentTypes, screen: string) => {
    track({
      ...commonProps,
      screen: toPascalCase(screen),
      control: 'Select',
      controlType: 'MenuItem',
      extras: {
        paymentMethod: type,
      },
    });
    sendSalePaymentMethodEvent(eventTarget, type);
  };

  const sendPageView = (screen: string, data?: Record<string, unknown>) => {
    page({
      ...commonProps,
      screen: toPascalCase(screen),
      action: 'Viewed',
      ...data,
    });
  };

  const sendOrderCreated = (
    screen: string,
    details: Record<string, unknown>,
  ) => {
    track({
      ...commonProps,
      screen: toPascalCase(screen),
      control: 'OrderCreated',
      controlType: 'Event',
      extras: {
        ...details,
      },
    });
  };

  return {
    track,
    page,
    sendPageView,
    sendCloseEvent,
    sendSuccessEvent,
    sendFailedEvent,
    sendTransactionSuccessEvent,
    sendOrderCreated,
    sendSelectedPaymentMethod,
  };
};

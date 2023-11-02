import { useContext } from 'react';
import { StandardAnalyticsActions } from '@imtbl/react-analytics';
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
    details?: Record<string, unknown>,
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
      },
    });
    sendSaleSuccessEvent(eventTarget, transactions);
  };

  const sendFailedEvent = (
    reason: string,
    transactions: ExecutedTransaction[] = [],
    screen: string = defaultView,
    details?: Record<string, unknown>,
  ) => {
    track({
      ...commonProps,
      screen: toPascalCase(screen),
      control: 'Fail',
      controlType: 'Event',
      action: 'Failed',
      extras: {
        transactions: toStringifyTransactions(transactions),
        ...details,
        ...orderProps,
        ...userProps,
        reason,
      },
    });
    sendSaleFailedEvent(eventTarget, reason, transactions);
  };

  const sendTransactionSuccessEvent = (transactions: ExecutedTransaction[]) => {
    sendSaleTransactionSuccessEvent(eventTarget, transactions);
  };

  const sendSelectedPaymentMethod = (type: string, screen: string) => {
    track({
      ...commonProps,
      screen: toPascalCase(screen),
      control: 'Select',
      controlType: 'MenuItem',
      extras: {
        paymentMethod: type,
      },
    });
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

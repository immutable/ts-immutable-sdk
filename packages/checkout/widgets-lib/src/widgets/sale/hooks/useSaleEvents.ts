import { useContext } from 'react';
import {
  TrackEventProps,
  UserJourney,
  useAnalytics,
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
    recipientAddress: userId, recipientEmail: email, signResponse, paymentMethod,
  } = useSaleContext();
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const defaultView = SaleWidgetViews.PAYMENT_METHODS;

  const common = {
    email,
    userId,
    paymentMethod,
    location: 'web',
    userJourney: UserJourney.SALE,
  };

  const orderProps = {
    amount: signResponse?.order.totalAmount,
    currency: signResponse?.order.currency.name,
  };

  const sendCloseEvent = (
    screen: TrackEventProps['screen'] = defaultView,
    controlType: TrackEventProps['controlType'] = 'Button',
    action: TrackEventProps['action'] = 'Pressed',
  ) => {
    const props: TrackEventProps = {
      screen: toPascalCase(screen),
      control: 'Close',
      controlType,
      action,
      ...common,
    };
    track(props);
    sendSaleWidgetCloseEvent(eventTarget);
  };

  const sendSuccessEvent = (
    screen: TrackEventProps['screen'] = defaultView,
    transactions: ExecutedTransaction[] = [],
    details?: Record<string, unknown>,
  ) => {
    track({
      ...details,
      screen: toPascalCase(screen),
      control: 'Success',
      controlType: 'Event',
      action: 'Succeeded',
      transactions: toStringifyTransactions(transactions),
      ...common,
      ...orderProps,
    });
    sendSaleSuccessEvent(eventTarget, transactions);
  };

  const sendFailedEvent = (
    reason: string,
    transactions: ExecutedTransaction[] = [],
    screen: TrackEventProps['screen'] = defaultView,
    details?: Record<string, unknown>,
  ) => {
    track({
      ...details,
      screen: toPascalCase(screen),
      control: 'Fail',
      controlType: 'Event',
      action: 'Failed',
      reason,
      transactions: toStringifyTransactions(transactions),
      ...common,
      ...orderProps,
    });
    sendSaleFailedEvent(eventTarget, reason, transactions);
  };

  const sendTransactionSuccessEvent = (transactions: ExecutedTransaction[]) => {
    sendSaleTransactionSuccessEvent(eventTarget, transactions);
  };

  const sendSelectedPaymentMethod = (type: string, screen: string) => {
    track({
      screen: toPascalCase(screen),
      control: 'Select',
      controlType: 'MenuItem',
      ...common,
      paymentMethod: type,
    });
  };

  const sendPageView = (screen: string, data?: Record<string, unknown>) => {
    page({
      screen: toPascalCase(screen),
      action: 'Viewed',
      ...data,
      ...common,
    });
  };

  const sendOrderCreated = (screen: string, details: Record<string, unknown>) => {
    track({
      ...details,
      screen: toPascalCase(screen),
      control: 'OrderCreated',
      controlType: 'Event',
      ...common,
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

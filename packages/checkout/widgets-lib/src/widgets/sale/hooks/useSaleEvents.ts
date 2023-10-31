import { useContext } from 'react';
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
import {
  UserJourney,
  useAnalytics,
  TrackEventProps,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';

export const useSaleEvent = () => {
  const { track, page } = useAnalytics();
  const { recipientAddress: userId, recipientEmail: email } = useSaleContext();
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const defaultView = SaleWidgetViews.PAYMENT_METHODS;

  const common = {
    email,
    userId,
    location: 'web',
    userJourney: UserJourney.SALE,
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
    transactions: ExecutedTransaction[] = [],
    paymentType = '',
    screen: TrackEventProps['screen'] = defaultView,
  ) => {
    track({
      screen: toPascalCase(screen),
      control: 'Success',
      controlType: 'Event',
      action: 'Succeeded',
      paymentType,
      transactions: toStringifyTransactions(transactions),
      ...common,
    });
    sendSaleSuccessEvent(eventTarget, transactions);
  };

  const sendFailedEvent = (
    reason: string,
    transactions: ExecutedTransaction[] = [],
    paymentType = '',
    screen: TrackEventProps['screen'] = defaultView,
  ) => {
    track({
      screen: toPascalCase(screen),
      control: 'Fail',
      controlType: 'Event',
      action: 'Failed',
      reason,
      paymentType,
      transactions: toStringifyTransactions(transactions),
      ...common,
    });
    sendSaleFailedEvent(eventTarget, reason, transactions);
  };

  const sendTransactionSuccessEvent = (transactions: ExecutedTransaction[]) => {
    sendSaleTransactionSuccessEvent(eventTarget, transactions);
  };

  const sendSelectedPaymentMethod = (paymentType: string, screen: string) => {
    track({
      screen: toPascalCase(screen),
      control: 'Select',
      controlType: 'MenuItem',
      paymentType,
      ...common,
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

  return {
    track,
    page,
    sendPageView,
    sendCloseEvent,
    sendSuccessEvent,
    sendFailedEvent,
    sendTransactionSuccessEvent,
    sendSelectedPaymentMethod,
  };
};

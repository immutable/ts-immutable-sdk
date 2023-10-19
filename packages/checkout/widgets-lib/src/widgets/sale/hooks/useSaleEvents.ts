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

const toStringifyTransactions = (transactions: ExecutedTransaction[]) => transactions
  .map(({ method, hash }) => `${method}: ${hash}`).join(' | ');

export const useSaleEvent = () => {
  const { track, page } = useAnalytics();
  const {
    recipientAddress: userId,
    recipientEmail: email,
    signResponse,
  } = useSaleContext();
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const defaultView = SaleWidgetViews.PAYMENT_METHODS;
  const userProps = {
    userId,
    email,
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
      screen,
      control: 'Close',
      controlType,
      action,
      userJourney: UserJourney.SALE,
      ...userProps,
    };
    track(props);
    sendSaleWidgetCloseEvent(eventTarget);
  };

  const sendSuccessEvent = (
    transactions: ExecutedTransaction[] = [],
    paymentType = '',
    screen: TrackEventProps['screen'] = defaultView,
    data?: Record<string, unknown>,
  ) => {
    track({
      ...data,
      screen,
      control: 'Success',
      controlType: 'Event',
      action: 'Succeeded',
      userJourney: UserJourney.SALE,
      paymentType,
      ...userProps,
      ...orderProps,
      transactions: toStringifyTransactions(transactions),
    });
    sendSaleSuccessEvent(eventTarget, transactions, data);
  };

  const sendFailedEvent = (
    reason: string,
    transactions: ExecutedTransaction[] = [],
    paymentType = '',
    screen: TrackEventProps['screen'] = defaultView,
    data?: Record<string, unknown>,
  ) => {
    track({
      ...data,
      screen,
      control: 'Fail',
      controlType: 'Event',
      action: 'Failed',
      userJourney: UserJourney.SALE,
      reason,
      paymentType,
      ...userProps,
      ...orderProps,
      transactions: toStringifyTransactions(transactions),
    });
    sendSaleFailedEvent(eventTarget, reason, transactions, data);
  };

  const sendTransactionSuccessEvent = (transactions: ExecutedTransaction[]) => {
    sendSaleTransactionSuccessEvent(eventTarget, transactions);
  };

  const sendSelectedPaymentMethod = (paymentType: string, screen: string) => {
    track({
      userJourney: UserJourney.CONNECT,
      screen,
      control: 'Select',
      controlType: 'MenuItem',
      paymentType,
      ...userProps,
    });
  };

  const sendPageView = (screen: string, data?: Record<string, unknown>) => {
    page({
      ...data,
      userJourney: UserJourney.SALE,
      screen,
      action: 'Viewed',
      ...userProps,
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

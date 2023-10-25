import { useContext } from 'react';
import { useAnalytics } from '../../../context/analytics-provider/CustomAnalyticsProvider';
import { TrackEventProps, UserJourney } from '../../../context/analytics-provider/segmentAnalyticsConfig';
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
  .map(({ method, hash }) => `${method}: ${hash}`)
  .join(' | ');

export const useSaleEvent = () => {
  const { track, page } = useAnalytics();
  const { recipientAddress: userId, recipientEmail: email } = useSaleContext();
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const defaultView = SaleWidgetViews.PAYMENT_METHODS;

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
      email,
      userId,
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
      screen,
      control: 'Success',
      controlType: 'Event',
      action: 'Succeeded',
      userJourney: UserJourney.SALE,
      userId,
      email,
      paymentType,
      transactions: toStringifyTransactions(transactions),
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
      screen,
      control: 'Fail',
      controlType: 'Event',
      action: 'Failed',
      userJourney: UserJourney.SALE,
      userId,
      email,
      reason,
      paymentType,
      transactions: toStringifyTransactions(transactions),
    });
    sendSaleFailedEvent(eventTarget, reason, transactions);
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
      userId,
      email,
      paymentType,
    });
  };

  const sendPageView = (screen: string, data?: Record<string, unknown>) => {
    page({
      userJourney: UserJourney.SALE,
      screen,
      userId,
      email,
      action: 'Viewed',
      ...data,
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

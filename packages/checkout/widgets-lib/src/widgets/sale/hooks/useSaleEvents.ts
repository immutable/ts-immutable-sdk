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
} from '../SaleWidgetEvents';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { ExecutedTransaction } from '../types';
import { useSaleContext } from '../context/SaleContextProvider';

const toStringifyTransactions = (transactions: ExecutedTransaction[]) => transactions
  .map(({ method, hash }) => `${method}: ${hash}`)
  .join(' | ');

export const useSaleEvent = () => {
  const { track } = useAnalytics();
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
      transactions: toStringifyTransactions(transactions),
    });
    sendSaleSuccessEvent(eventTarget, transactions);
  };

  const sendFailedEvent = (
    reason: string,
    screen: TrackEventProps['screen'] = defaultView,
    transactions: ExecutedTransaction[] = [],
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
      transactions: toStringifyTransactions(transactions),
    });
    sendSaleFailedEvent(eventTarget, reason);
  };

  return {
    track,
    sendCloseEvent,
    sendSuccessEvent,
    sendFailedEvent,
  };
};

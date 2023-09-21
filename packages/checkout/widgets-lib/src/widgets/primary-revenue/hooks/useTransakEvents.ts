import { RefObject, useCallback, useEffect } from 'react';
import { StandardAnalyticsActions } from '@imtbl/react-analytics';
import {
  AnalyticsControlTypes,
  UserJourney,
  useAnalytics,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import {
  TransakEventData,
  TransakEvents,
  TransakStatuses,
} from '../../on-ramp/TransakEvents';

const TRANSAK_ORIGIN = 'transak.com';

export type TransakEventHandlers = {
  onOpen?: () => void;
  onOrderCreated?: () => void;
  onOrderProcessing?: () => void;
  onOrderCompleted?: () => void;
  onOrderFailed?: () => void;
};

type AnalyticEvent = {
  screen: string;
  userJourney?: UserJourney;
  control: string;
  controlType: AnalyticsControlTypes;
  action?: StandardAnalyticsActions;
  userId?: string;
  [key: string]: unknown;
};

const ANALYTICS_EVENTS: Record<string, AnalyticEvent> = {
  [TransakEvents.TRANSAK_WIDGET_OPEN]: {
    screen: 'InputScreen',
    control: 'TransakWidgetOpen',
    controlType: 'IframeEvent',
  },
  [TransakEvents.TRANSAK_ORDER_CREATED]: {
    screen: 'InputScreen',
    control: 'OrderCreated',
    controlType: 'IframeEvent',
  },
  [`${TransakEvents.TRANSAK_ORDER_SUCCESSFUL}${TransakStatuses.PROCESSING}`]: {
    screen: 'OrderInProgress',
    control: 'PaymentProcessing',
    controlType: 'IframeEvent',
  },
  [`${TransakEvents.TRANSAK_ORDER_SUCCESSFUL}${TransakStatuses.COMPLETED}`]: {
    screen: 'Success',
    control: 'PaymentCompleted',
    controlType: 'IframeEvent',
  },
  [TransakEvents.TRANSAK_ORDER_FAILED]: {
    screen: 'Failure',
    control: 'PaymentFailed',
    controlType: 'IframeEvent',
  },
};

type UseTransakEventsProps = {
  userJourney: UserJourney;
  ref: RefObject<HTMLIFrameElement> | undefined;
  email: string;
  userId: string;
  isPassportWallet: boolean;
} & TransakEventHandlers;

export const useTransakEvents = (props: UseTransakEventsProps) => {
  const {
    userJourney, ref, email, userId, isPassportWallet,
  } = props;
  const { track } = useAnalytics();

  const handleAnalyticsEvent = useCallback((event: TransakEventData) => {
    const type = event.event_id;
    const key = [TransakEvents.TRANSAK_ORDER_SUCCESSFUL].includes(type)
      ? `${type}${event.data.status}`
      : type;

    const eventData = ANALYTICS_EVENTS?.[key] || {};

    if (Object.keys(eventData).length >= 0) {
      track({
        ...eventData,
        email,
        userId,
        userJourney,
        isPassportWallet,
      });
    }
  }, []);

  const handleEvents = useCallback((event: TransakEventData) => {
    switch (event.event_id) {
      case TransakEvents.TRANSAK_WIDGET_OPEN:
        props.onOpen?.();
        break;
      case TransakEvents.TRANSAK_ORDER_CREATED:
        props.onOrderCreated?.();
        break;
      case TransakEvents.TRANSAK_ORDER_SUCCESSFUL:
        if (event.data.status === TransakStatuses.PROCESSING) {
          props.onOrderProcessing?.();
        }
        if (event.data.status === TransakStatuses.COMPLETED) {
          props.onOrderCompleted?.();
        }
        break;
      case TransakEvents.TRANSAK_ORDER_FAILED:
        props.onOrderFailed?.();
        break;
      default:
        break;
    }
  }, []);

  const handleMessageEvent = useCallback(
    (event: MessageEvent) => {
      const isTransakEvent = event.source === ref?.current?.contentWindow
        && event.origin.toLowerCase().includes(TRANSAK_ORIGIN);

      if (!isTransakEvent) return;

      handleAnalyticsEvent(event.data);
      handleEvents(event.data);

      console.log('event', event);
    },
    [ref],
  );

  const subscribeEvents = useCallback(() => {
    window.addEventListener('message', handleMessageEvent);

    return () => {
      window.removeEventListener('message', handleMessageEvent);
    };
  }, []);

  useEffect(() => {
    const unsubscribeEvents = subscribeEvents();
    return () => unsubscribeEvents();
  }, []);
};

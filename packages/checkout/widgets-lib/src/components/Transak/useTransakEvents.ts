import {
  RefObject, useCallback, useEffect, useRef, useState,
} from 'react';
import { StandardAnalyticsActions } from '@imtbl/react-analytics';

import { TransakEvent, TransakEvents, TransakStatuses } from './TransakEvents';
import {
  AnalyticsControlTypes,
  UserJourney,
} from '../../context/analytics-provider/segmentAnalyticsConfig';
import { useAnalytics } from '../../context/analytics-provider/CustomAnalyticsProvider';

const TRANSAK_ORIGIN = 'transak.com';
const FAILED_TO_LOAD_TIMEOUT_IN_MS = 5000;

export type TransakEventHandlers = {
  onInit?: () => void;
  onOpen?: () => void;
  onOrderCreated?: () => void;
  onOrderProcessing?: () => void;
  onOrderCompleted?: () => void;
  onOrderFailed?: () => void;
  onFailedToLoad?: () => void;
  failedToLoadTimeoutInMs?: number;
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
  const { track } = useAnalytics();
  const {
    userJourney, ref, email, userId, isPassportWallet, failedToLoadTimeoutInMs, onFailedToLoad,
  } = props;
  const [initialised, setInitialsed] = useState<boolean>(false);
  const failedToLoadTimeout = failedToLoadTimeoutInMs || FAILED_TO_LOAD_TIMEOUT_IN_MS;

  const timeout = useRef<NodeJS.Timeout | number>(0);

  const onInit = () => {
    setInitialsed(true);
    clearTimeout(timeout.current);
    props.onInit?.();
  };

  const onLoad = () => {
    if (onFailedToLoad === undefined) return;

    if (!initialised) {
      timeout.current = setTimeout(() => {
        if (!initialised) onFailedToLoad();
      }, failedToLoadTimeout);
    }
  };

  const handleAnalyticsEvent = useCallback((event: TransakEvent) => {
    const type = event.event_id as TransakEvents;
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

  const handleEvents = useCallback((event: TransakEvent) => {
    switch (event.event_id) {
      case TransakEvents.TRANSAK_WIDGET_INITIALISED:
        onInit();
        break;
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

      console.log('@@@ Transak event', event); // eslint-disable-line no-console
    },
    [ref],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessageEvent);
    return () => {
      clearTimeout(timeout.current);
      window.removeEventListener('message', handleMessageEvent);
    };
  }, []);

  return {
    initialised, onLoad,
  };
};

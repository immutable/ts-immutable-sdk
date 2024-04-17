import {
  RefObject, useCallback, useEffect, useRef, useState,
} from 'react';
import { StandardAnalyticsActions } from '@imtbl/react-analytics';

import * as url from 'url';
import { TransakEvent, TransakEvents, TransakStatuses } from './TransakEvents';
import {
  AnalyticsControlTypes,
  UserJourney,
  useAnalytics,
} from '../../context/analytics-provider/SegmentAnalyticsProvider';

export const TRANSAK_ORIGIN = ['global.transak.com', 'global-stg.transak.com'];
const FAILED_TO_LOAD_TIMEOUT_IN_MS = 10000;

export type TransakEventHandlers = {
  onInit?: (data: Record<string, unknown>) => void;
  onOpen?: (data: Record<string, unknown>) => void;
  onOrderCreated?: (data: Record<string, unknown>) => void;
  onOrderProcessing?: (data: Record<string, unknown>) => void;
  onOrderCompleted?: (data: Record<string, unknown>) => void;
  onOrderFailed?: (data: Record<string, unknown>) => void;
  onFailedToLoad?: () => void;
  failedToLoadTimeoutInMs?: number;
};

type AnalyticEvent = {
  screen: string;
  userJourney?: UserJourney;
  control: string;
  controlType: AnalyticsControlTypes;
  action?: StandardAnalyticsActions;
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
  walletAddress: string;
  isPassportWallet: boolean;
} & TransakEventHandlers;

export const useTransakEvents = (props: UseTransakEventsProps) => {
  const { track } = useAnalytics();
  const {
    userJourney, ref, walletAddress, isPassportWallet, failedToLoadTimeoutInMs, onFailedToLoad,
  } = props;
  const [initialised, setInitialsed] = useState<boolean>(false);
  const failedToLoadTimeout = failedToLoadTimeoutInMs || FAILED_TO_LOAD_TIMEOUT_IN_MS;

  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onInit = (data: Record<string, unknown>) => {
    setInitialsed(true);
    clearTimeout(timeout.current);
    timeout.current = undefined;
    props.onInit?.(data);
  };

  const onLoad = () => {
    if (onFailedToLoad === undefined) return;

    if (timeout.current === undefined && !initialised) {
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
        userJourney,
        extras: {
          walletAddress,
          isPassportWallet,
        },
      });
    }
  }, []);

  const handleEvents = useCallback((event: TransakEvent) => {
    switch (event.event_id) {
      case TransakEvents.TRANSAK_WIDGET_INITIALISED:
        onInit(event.data);
        break;
      case TransakEvents.TRANSAK_WIDGET_OPEN:
        props.onOpen?.(event.data);
        break;
      case TransakEvents.TRANSAK_ORDER_CREATED:
        props.onOrderCreated?.(event.data);
        break;
      case TransakEvents.TRANSAK_ORDER_SUCCESSFUL:
        if (event.data.status === TransakStatuses.PROCESSING) {
          props.onOrderProcessing?.(event.data);
        }
        if (event.data.status === TransakStatuses.COMPLETED) {
          props.onOrderCompleted?.(event.data);
        }
        break;
      case TransakEvents.TRANSAK_ORDER_FAILED:
        props.onOrderFailed?.(event.data);
        break;
      default:
        break;
    }
  }, []);

  const handleMessageEvent = useCallback(
    (event: MessageEvent) => {
      const host = url.parse(event.origin)?.host?.toLowerCase();
      const isTransakEvent = event.source === ref?.current?.contentWindow
        && host && TRANSAK_ORIGIN.includes(host);

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

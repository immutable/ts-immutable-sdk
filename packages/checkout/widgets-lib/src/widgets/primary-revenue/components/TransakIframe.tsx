import { Box } from '@biom3/react';
import {
  useCallback, RefObject, useEffect, useRef,
} from 'react';

import {
  TransakEventData,
  TransakEvents,
  TransakStatuses,
} from '../../on-ramp/TransakEvents';
import { useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

// import { useTransak } from '../hooks/useTransak';

type AnalyticEvent = {
  screen: string;
  userJourney?: string;
  control: string;
  controlType: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
};

const analyticsEvents: Record<string, AnalyticEvent> = {
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

const TRANSAK_ORIGIN = 'transak.com';
const useTransakEvents = (
  userJourney: string,
  ref: RefObject<HTMLIFrameElement> | undefined,
  email: string,
  walletAddress: string,
  isPassportWallet: boolean,
) => {
  const { track } = useAnalytics();

  const handleAnalyticsEvent = useCallback((event: TransakEventData) => {
    const eventData = analyticsEvents?.[event.event_id] || {};
    const miscData = {
      email,
      isPassportWallet,
      userId,
      userJourney,
    };

    track({
      ...eventData,
    });
  }, []);

  const handleMessageEvent = useCallback(
    (event: MessageEvent) => {
      const isTransakEvent = event.source === ref?.current?.contentWindow
        && event.origin.toLowerCase().includes(TRANSAK_ORIGIN);

      if (!isTransakEvent) return;

      handleAnalyticsEvent(event.data);

      console.log('event', event);
    },
    [ref],
  );

  const subscribeEvents = useCallback(() => {
    console.log(ref?.current);

    window.addEventListener('message', handleMessageEvent);

    return () => {
      /** */
    };
  }, []);

  return {
    subscribeEvents,
  };
};

export interface TransactionIframeProps {
  id: string;
  src: string;
  email: string;
  walletAddress: string;
  isPassportWallet: boolean;
}

export function TransakIframe({
    id, 
    src,
  email,
  walletAddress,
  isPassportWallet,
}: TransactionIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { subscribeEvents } = useTransakEvents(
    'nft-checkout',
    iframeRef,
    email,
    walletAddress,
    isPassportWallet,
  );

  useEffect(() => {
    const unsubscribeEvents = subscribeEvents();
    return () => unsubscribeEvents();
  }, []);

  return (
    <Box
      style={{
        display: 'block',
        position: 'relative',
        maxWidth: '420px',
        height: '565px',
        borderRadius: 'base.borderRadius.x6',
        overflow: 'hidden',
        marginLeft: 'base.spacing.x2',
        marginRight: 'base.spacing.x2',
        marginBottom: 'base.spacing.x2',
        margin: '0 auto',
      }}
    >
      <iframe
        ref={iframeRef}
        id={id}
        src={src}
        title="Transak-Iframe"
        allow="camera;microphone;fullscreen;payment"
        style={{
          height: '100%',
          width: '100%',
          border: 'none',
          position: 'absolute',
        }}
      />
    </Box>
  );
}

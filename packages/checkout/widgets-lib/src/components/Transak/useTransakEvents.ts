import {
  RefObject, useCallback, useEffect, useRef, useState,
} from 'react';
import * as url from 'url';
import { TransakEvent, TransakEvents, TransakStatuses } from './TransakEvents';

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

type UseTransakEventsProps = {
  ref: RefObject<HTMLIFrameElement> | undefined;
} & TransakEventHandlers;

export const useTransakEvents = (props: UseTransakEventsProps) => {
  const {
    ref, failedToLoadTimeoutInMs, onFailedToLoad,
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

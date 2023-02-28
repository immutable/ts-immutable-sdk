import { Error as ErrorDetails } from './types';
import { RESPONSE_EVENTS } from './events';

export type ResponseMessageDetails<T> = {
  success: boolean;
  data: T;
  error?: ErrorDetails;
};

export type ResponseMessage<T> = {
  type: RESPONSE_EVENTS;
  details: ResponseMessageDetails<T>;
};

export function messageResponseListener<T>(
  event: MessageEvent,
  eventType: RESPONSE_EVENTS,
  iframe: HTMLIFrameElement,
  callback: (response: ResponseMessageDetails<T>) => void,
) {
  if (iframe && event.source !== iframe.contentWindow) {
    return;
  }

  const l2WalletMessage = event.data as ResponseMessage<T>;
  if (l2WalletMessage.type !== eventType) {
    return;
  }

  callback(l2WalletMessage.details as ResponseMessageDetails<T>);
}

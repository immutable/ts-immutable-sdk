import { Error as ErrorDetails } from './types';
import { RESPONSE_EVENTS } from './events';
import { getIFrame } from './imxWalletIFrame';

export type ResponseMessageDetails<T> = {
  success: boolean;
  data: T;
  error?: ErrorDetails;
};

// todo: not using this type atm
// export type ErrorResponseMessageDetails = {
//   success: false;
//   error: ErrorDetails;
// };

export type ResponseMessage<T> = {
  type: RESPONSE_EVENTS;
  details: ResponseMessageDetails<T>;
};

// todo: not using this type atm
// export type ErrorResponseMessage = {
//   type: RESPONSE_EVENTS;
//   details: ErrorResponseMessageDetails;
// };

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

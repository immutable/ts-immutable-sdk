import { RequestEventType } from './events';

export type RequestMessage<T> = {
  type: RequestEventType;
  details?: T;
};

export function postRequestMessage<T>(
  iframe: HTMLIFrameElement,
  payload: RequestMessage<T>,
) {
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(payload, new URL(iframe.src).origin);
  }
}

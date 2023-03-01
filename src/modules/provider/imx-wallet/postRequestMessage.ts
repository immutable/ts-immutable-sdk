import { RequestEventType } from './events';

export type RequestMessage<T> = {
  type: RequestEventType;
  details?: T;
};

// do we want to move iframe to first param
export function postRequestMessage<T>(
  iframe: HTMLIFrameElement,
  payload: RequestMessage<T>
) {
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(payload, new URL(iframe.src).origin);
  }
}

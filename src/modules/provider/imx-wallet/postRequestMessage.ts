import { REQUEST_EVENTS } from './events';
import { getIFrame } from './imxWalletIFrame';

export type RequestMessage<T> = {
  type: REQUEST_EVENTS;
  details?: T;
};

// TODO: This function would suit better if moved to L2Provider package
export function postRequestMessage<T>(payload: RequestMessage<T>) {
  const iFrame = getIFrame();

  if (iFrame && iFrame.contentWindow) {
    iFrame.contentWindow.postMessage(payload, new URL(iFrame.src).origin);
  }
}

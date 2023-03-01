import { ENVIRONMENTS } from '../constants';
import { ConnectResponse } from './types';
import { RESPONSE_EVENTS } from './events';
import { messageResponseListener } from './messageResponseListener';
import { setupIframe } from './imxWalletIFrame';

import { htmlBodyInit, asyncTriggerIframeOnLoad } from './testUtils';

const callbackFn = jest.fn();

function getMessageEvent(
  eventOrigin: string,
  eventType: RESPONSE_EVENTS,
  iframe: HTMLIFrameElement
): MessageEvent {
  return {
    origin: eventOrigin,
    data: {
      type: eventType,
      details: {
        success: true,
        data: { starkPublicKey: '0x000' },
      },
    },
    source: iframe.contentWindow,
  } as MessageEvent;
}

describe('the messageResponseListener function', () => {
  let iframe: HTMLIFrameElement;
  let iFrameURL = '';

  beforeEach(async () => {
    htmlBodyInit();

    iframe = await asyncTriggerIframeOnLoad(
      setupIframe(ENVIRONMENTS.DEVELOPMENT)
    );

    if (iframe) {
      iFrameURL = new URL(iframe.src).origin;
    }
  });

  afterEach(() => jest.clearAllMocks());

  it('should call the callback if the message is valid', () => {
    messageResponseListener<ConnectResponse>(
      iframe,
      getMessageEvent(
        iFrameURL,
        RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
        iframe
      ),
      RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
      callbackFn
    );

    expect(callbackFn).toBeCalled();
  });

  it('should ignore events from unknown iframes', () => {
    messageResponseListener<ConnectResponse>(
      iframe,
      getMessageEvent(
        'http://anyotherorigin.com',
        RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
        {
          source: {} as unknown as WindowProxy,
        } as unknown as HTMLIFrameElement
      ),
      RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
      callbackFn
    );

    expect(callbackFn).not.toBeCalled();
  });

  it('should ignore events if the type does not match', () => {
    messageResponseListener<ConnectResponse>(
      iframe,
      getMessageEvent(iFrameURL, RESPONSE_EVENTS.SIGN_MESSAGE_RESPONSE, iframe),
      RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
      callbackFn
    );

    expect(callbackFn).not.toBeCalled();
  });
});

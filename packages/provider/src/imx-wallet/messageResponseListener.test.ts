/*
 * @jest-environment jsdom
 */

import { Environment } from '@imtbl/config';
import { ConnectResponse } from './types';
import { ResponseEventType } from './events';
import { messageResponseListener } from './messageResponseListener';
import { setupIFrame } from './imxWalletIFrame';

import { htmlBodyInit, asyncTriggerIFrameOnLoad } from './testUtils';

const callbackFn = jest.fn();

function getMessageEvent(
  eventOrigin: string,
  eventType: ResponseEventType,
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

    iframe = await asyncTriggerIFrameOnLoad(setupIFrame(Environment.SANDBOX));

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
        ResponseEventType.CONNECT_WALLET_RESPONSE,
        iframe
      ),
      ResponseEventType.CONNECT_WALLET_RESPONSE,
      callbackFn
    );

    expect(callbackFn).toBeCalled();
  });

  it('should ignore events from unknown iframes', () => {
    messageResponseListener<ConnectResponse>(
      iframe,
      getMessageEvent(
        'http://anyotherorigin.com',
        ResponseEventType.CONNECT_WALLET_RESPONSE,
        {
          source: {} as unknown as WindowProxy,
        } as unknown as HTMLIFrameElement
      ),
      ResponseEventType.CONNECT_WALLET_RESPONSE,
      callbackFn
    );

    expect(callbackFn).not.toBeCalled();
  });

  it('should ignore events if the type does not match', () => {
    messageResponseListener<ConnectResponse>(
      iframe,
      getMessageEvent(
        iFrameURL,
        ResponseEventType.SIGN_MESSAGE_RESPONSE,
        iframe
      ),
      ResponseEventType.CONNECT_WALLET_RESPONSE,
      callbackFn
    );

    expect(callbackFn).not.toBeCalled();
  });
});

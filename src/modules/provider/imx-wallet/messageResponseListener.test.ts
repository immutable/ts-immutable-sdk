import { ENVIRONMENTS } from './constants';
import { ConnectResponse } from './types';
import { RESPONSE_EVENTS } from './events';
import { messageResponseListener } from './messageResponseListener';
import { setupIFrame } from './imxWalletIFrame';

import { htmlBodyInit, triggerIFrameOnLoad } from './testUtils';

const callbackFn = jest.fn();
let iFrameURL = '';

function getMessageEvent(
  eventOrigin: string,
  eventType: RESPONSE_EVENTS,
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
  } as MessageEvent;
}

describe('the messageResponseListener function', () => {
  beforeEach(async () => {
    htmlBodyInit();

    const setup = setupIFrame(ENVIRONMENTS.DEVELOPMENT);

    const iFrame = triggerIFrameOnLoad();

    if (iFrame) {
      iFrameURL = new URL(iFrame.src).origin;
    }

    await setup;
  });

  afterEach(() => jest.clearAllMocks());

  it('should call the callback if the message is valid', () => {
    messageResponseListener<ConnectResponse>(
      getMessageEvent(
        iFrameURL,
        RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
      ),
      RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
      callbackFn,
    );

    expect(callbackFn).toBeCalled();
  });

  it('should ignore events from unknown origins', () => {
    messageResponseListener<ConnectResponse>(
      getMessageEvent(
        'http://anyotherorigin.com',
        RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
      ),
      RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
      callbackFn,
    );

    expect(callbackFn).not.toBeCalled();
  });

  it('should ignore events if the type does not match', () => {
    messageResponseListener<ConnectResponse>(
      getMessageEvent(
        iFrameURL,
        RESPONSE_EVENTS.SIGN_MESSAGE_RESPONSE,
      ),
      RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
      callbackFn,
    );

    expect(callbackFn).not.toBeCalled();
  });
});

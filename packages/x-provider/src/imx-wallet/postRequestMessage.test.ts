/*
 * @jest-environment jsdom
 */

import { ConnectRequest } from './types';
import { RequestEventType } from './events';
import { postRequestMessage } from './postRequestMessage';
import { IMX_WALLET_IFRAME_HOSTS } from './imxWalletIFrame';

const postMessageMock = jest.fn();
const iframe = {
  src: 'https://wallets.sandbox.immutable.com',
  contentWindow: { postMessage: postMessageMock },
} as unknown as HTMLIFrameElement;

jest.mock('./imxWalletIFrame', () => ({
  ...jest.requireActual('./imxWalletIFrame'),
  getIFrame: () => iframe,
}));

describe('the postRequestMessage function', () => {
  it('should post the event to the iFrame contentWindow', async () => {
    const postMessage = {
      type: RequestEventType.CONNECT_WALLET_REQUEST,
      details: { ethAddress: '0x000', signature: 'The message' },
    };

    postRequestMessage<ConnectRequest>(iframe, postMessage);

    expect(postMessageMock).toHaveBeenCalledWith(
      postMessage,
      IMX_WALLET_IFRAME_HOSTS.sandbox,
    );
  });
});

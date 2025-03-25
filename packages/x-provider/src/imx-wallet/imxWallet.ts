import { Environment } from '@imtbl/config';
import {
  BrowserProvider,
  toUtf8String,
} from 'ethers';
import {
  ConnectRequest,
  ConnectResponse,
  DisconnectRequest,
  DisconnectResponse,
} from './types';
import {
  COMMUNICATION_TYPE,
  RequestEventType,
  ResponseEventType,
} from './events';
import { postRequestMessage } from './postRequestMessage';
import { messageResponseListener } from './messageResponseListener';
import { ImxSigner } from './ImxSigner';
import { getOrSetupIFrame } from './imxWalletIFrame';

// "Only sign this request if you've initiated an action with Immutable X."
const DEFAULT_CONNECTION_BYTES = new Uint8Array([
  79, 110, 108, 121, 32, 115, 105, 103, 110, 32, 116, 104, 105, 115, 32, 114,
  101, 113, 117, 101, 115, 116, 32, 105, 102, 32, 121, 111, 117, 226, 128, 153,
  118, 101, 32, 105, 110, 105, 116, 105, 97, 116, 101, 100, 32, 97, 110, 32,
  97, 99, 116, 105, 111, 110, 32, 119, 105, 116, 104, 32, 73, 109, 109, 117,
  116, 97, 98, 108, 101, 32, 88, 46,
]);
const CONNECTION_FAILED_ERROR = 'The L2 IMX Wallet connection has failed';

export async function connect(
  l1Provider: BrowserProvider,
  env: Environment,
): Promise<ImxSigner> {
  const l1Signer = await l1Provider.getSigner();
  const address = await l1Signer.getAddress();

  // log read message here
  console.log('DEFAULT_CONNECTION_BYTES.toString()', { bytes: DEFAULT_CONNECTION_BYTES.toString() });
  console.log('DEFAULT_CONNECTION_BYTES.toUtf8String()', { bytes: toUtf8String(DEFAULT_CONNECTION_BYTES) });

  const signature = await l1Signer.signMessage(DEFAULT_CONNECTION_BYTES);
  const iframe = await getOrSetupIFrame(env);

  return new Promise((resolve, reject) => {
    const listener = (event: MessageEvent) => {
      messageResponseListener<ConnectResponse>(
        iframe,
        event,
        ResponseEventType.CONNECT_WALLET_RESPONSE,
        (messageDetails) => {
          window.removeEventListener(COMMUNICATION_TYPE, listener);

          if (!messageDetails.success) {
            reject(new Error(CONNECTION_FAILED_ERROR));
          }

          resolve(new ImxSigner(messageDetails.data.starkPublicKey, iframe));
        },
      );
    };
    window.addEventListener(COMMUNICATION_TYPE, listener);

    postRequestMessage<ConnectRequest>(iframe, {
      type: RequestEventType.CONNECT_WALLET_REQUEST,
      details: { ethAddress: address, signature },
    });
  });
}

export async function disconnect(imxSigner: ImxSigner): Promise<void> {
  const iframe = imxSigner.getIFrame();

  return new Promise((resolve, reject) => {
    const listener = (event: MessageEvent) => {
      messageResponseListener<DisconnectResponse>(
        iframe,
        event,
        ResponseEventType.DISCONNECT_WALLET_RESPONSE,
        (messageDetails) => {
          window.removeEventListener(COMMUNICATION_TYPE, listener);

          if (!messageDetails.success && messageDetails.error) {
            reject(messageDetails.error);
          }

          iframe.remove();
          resolve();
        },
      );
    };

    window.addEventListener(COMMUNICATION_TYPE, listener);

    postRequestMessage<DisconnectRequest>(iframe, {
      type: RequestEventType.DISCONNECT_WALLET_REQUEST,
      details: { starkPublicKey: imxSigner.getAddress() },
    });
  });
}

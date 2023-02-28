import { ethers } from 'ethers';
import {
  ConnectRequest,
  ConnectResponse,
  DisconnectRequest,
  DisconnectResponse,
} from './types';
import { COMMUNICATION_TYPE, REQUEST_EVENTS, RESPONSE_EVENTS } from './events';
import { postRequestMessage } from './postRequestMessage';
import { messageResponseListener } from './messageResponseListener';
import { ImxSigner } from './ImxSigner';
import { ENVIRONMENTS } from '../constants';
import { getOrSetIframe } from './imxWalletIFrame';

const DEFAULT_CONNECTION_MESSAGE =
  'Only sign this request if you’ve initiated an action with ImmutableX.';
const CONNECTION_FAILED_ERROR = 'The L2 IMX Wallet connection has failed.';

export async function connect(
  l1Provider: ethers.providers.Web3Provider,
  env: ENVIRONMENTS
): Promise<ImxSigner> {
  const l1Signer = l1Provider.getSigner();
  const address = await l1Signer.getAddress();
  const signature = await l1Signer.signMessage(DEFAULT_CONNECTION_MESSAGE);
  const iframe = await getOrSetIframe(env);

  return new Promise((resolve, reject) => {
    const listener = (event: MessageEvent) => {
      messageResponseListener<ConnectResponse>(
        event,
        RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
        iframe,
        (messageDetails) => {
          window.removeEventListener(COMMUNICATION_TYPE, listener);

          if (!messageDetails.success) {
            reject(new Error(CONNECTION_FAILED_ERROR));
          }

          resolve(new ImxSigner(messageDetails.data.starkPublicKey, iframe));
        }
      );
    };
    window.addEventListener(COMMUNICATION_TYPE, listener);

    postRequestMessage<ConnectRequest>(
      {
        type: REQUEST_EVENTS.CONNECT_WALLET_REQUEST,
        details: { ethAddress: address, signature },
      },
      iframe
    );
  });
}

export async function disconnect(imxSigner: ImxSigner): Promise<void> {
  const iframe = imxSigner.getIframe();

  return new Promise((resolve, reject) => {
    const listener = (event: MessageEvent) => {
      messageResponseListener<DisconnectResponse>(
        event,
        RESPONSE_EVENTS.DISCONNECT_WALLET_RESPONSE,
        iframe,
        (messageDetails) => {
          window.removeEventListener(COMMUNICATION_TYPE, listener);

          if (!messageDetails.success && messageDetails.error) {
            // investigate if we should reject or log here
            reject();
          }

          iframe.remove();
          resolve();
        }
      );
    };

    window.addEventListener(COMMUNICATION_TYPE, listener);

    postRequestMessage<DisconnectRequest>(
      {
        type: REQUEST_EVENTS.DISCONNECT_WALLET_REQUEST,
        details: { starkPublicKey: imxSigner.getAddress() },
      },
      iframe
    );
  });
}

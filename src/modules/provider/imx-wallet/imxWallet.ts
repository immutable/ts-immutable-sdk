import { ethers } from 'ethers';
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
import { Environment } from '../constants';
import { getOrSetupIFrame } from './imxWalletIFrame';

const DEFAULT_CONNECTION_MESSAGE = 'Only sign this request if you’ve initiated an action with Immutable X.';
const CONNECTION_FAILED_ERROR = 'The L2 IMX Wallet connection has failed.';

export async function connect(
  l1Provider: ethers.providers.Web3Provider,
  env: Environment,
): Promise<ImxSigner> {
  const l1Signer = l1Provider.getSigner();
  const address = await l1Signer.getAddress();
  const signature = await l1Signer.signMessage(DEFAULT_CONNECTION_MESSAGE);
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

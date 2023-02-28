import { ethers } from 'ethers';
import {
  ConnectRequest,
  ConnectResponse,
  DisconnectRequest,
  DisconnectResponse,
  GetConnectionRequest,
  GetConnectionResponse,
} from './types';
import { StarkSigner } from '../../../types';
import {
  COMMUNICATION_TYPE,
  REQUEST_EVENTS,
  RESPONSE_EVENTS,
} from './events';
import { postRequestMessage } from './postRequestMessage';
import { messageResponseListener } from './messageResponseListener';
import { ImxSigner } from './ImxSigner';

const DEFAULT_CONNECTION_MESSAGE = 'Only sign this request if you’ve initiated an action with ImmutableX.';
const CONNECTION_FAILED_ERROR = 'The L2 IMX Wallet connection has failed.';

export async function connect(l1Provider: ethers.providers.Web3Provider): Promise<StarkSigner> {
  const l1Signer = l1Provider.getSigner();
  const address = await l1Signer.getAddress();
  const signature = await l1Signer.signMessage(DEFAULT_CONNECTION_MESSAGE);

  return new Promise((resolve, reject) => {
    const listener = (event: MessageEvent) => {
      messageResponseListener<ConnectResponse>(
        event,
        RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
        (messageDetails) => {
          window.removeEventListener(COMMUNICATION_TYPE, listener);

          if (!messageDetails.success) {
            reject(new Error(CONNECTION_FAILED_ERROR));
          }

          resolve(new ImxSigner(messageDetails.data.starkPublicKey));
        },
      );
    };
    window.addEventListener(COMMUNICATION_TYPE, listener);

    postRequestMessage<ConnectRequest>({
      type: REQUEST_EVENTS.CONNECT_WALLET_REQUEST,
      details: { ethAddress: address, signature },
    });
  });
}

export async function getConnection(etherAddress: string): Promise<StarkSigner | undefined> {
  return new Promise((resolve) => {
    const listener = (event: MessageEvent) => {
      messageResponseListener<GetConnectionResponse>(
        event,
        RESPONSE_EVENTS.GET_CONNECTION_RESPONSE,
        (messageDetails) => {
          window.removeEventListener(COMMUNICATION_TYPE, listener);
          if (!messageDetails.success) {
            resolve(undefined);
            return;
          }

          resolve(new ImxSigner(messageDetails.data.starkPublicKey));
        },
      );
    };
    window.addEventListener(COMMUNICATION_TYPE, listener);

    postRequestMessage<GetConnectionRequest>({
      type: REQUEST_EVENTS.GET_CONNECTION_REQUEST,
      details: { etherAddress },
    });
  });
}

export async function disconnect(starkPublicKey: string): Promise<void> {
  return new Promise((resolve) => {
    const listener = (event: MessageEvent) => {
      messageResponseListener<DisconnectResponse>(
        event,
        RESPONSE_EVENTS.DISCONNECT_WALLET_RESPONSE,
        (messageDetails) => {
          window.removeEventListener(COMMUNICATION_TYPE, listener);

          if (!messageDetails.success && messageDetails.error) {
            // todo: there is just a log here - what should we do? remove this whole if block? reject?
            // addLog(
            //   'sdk',
            //   'imxWallet:disconnect - an error happened disconnecting inside the IMX Wallet',
            //   { error: messageDetails.error },
            // );
          }

          resolve();
        },
      );
    };

    window.addEventListener(COMMUNICATION_TYPE, listener);

    postRequestMessage<DisconnectRequest>({
      type: REQUEST_EVENTS.DISCONNECT_WALLET_REQUEST,
      details: { starkPublicKey },
    });
  });
}

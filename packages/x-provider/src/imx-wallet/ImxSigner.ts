import { StarkSigner } from '@imtbl/x-client';
import {
  COMMUNICATION_TYPE,
  ResponseEventType,
  RequestEventType,
} from './events';
import { messageResponseListener } from './messageResponseListener';
import { postRequestMessage } from './postRequestMessage';
import {
  GetYCoordinateMessageRequest,
  GetYCoordinateMessageResponse,
  SignMessageRequest,
  SignMessageResponse,
} from './types';

export class ImxSigner implements StarkSigner {
  private publicAddress;

  private iframe;

  constructor(publicAddress: string, iframe: HTMLIFrameElement) {
    this.publicAddress = publicAddress;
    this.iframe = iframe;
  }

  public getAddress(): string {
    return this.publicAddress;
  }

  public signMessage(rawMessage: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const listener = (event: MessageEvent) => {
        messageResponseListener<SignMessageResponse>(
          this.iframe,
          event,
          ResponseEventType.SIGN_MESSAGE_RESPONSE,
          (messageDetails) => {
            window.removeEventListener(COMMUNICATION_TYPE, listener);

            if (!messageDetails.success) {
              reject(new Error(messageDetails.error?.message));
            }

            resolve(messageDetails.data.signedMessage);
          },
        );
      };
      window.addEventListener(COMMUNICATION_TYPE, listener);

      postRequestMessage<SignMessageRequest>(this.iframe, {
        type: RequestEventType.SIGN_MESSAGE_REQUEST,
        details: { starkPublicKey: this.publicAddress, message: rawMessage },
      });
    });
  }

  public getIFrame(): HTMLIFrameElement {
    return this.iframe;
  }

  public getYCoordinate(): Promise<string> {
    return new Promise((resolve, reject) => {
      const listener = (event: MessageEvent) => {
        messageResponseListener<GetYCoordinateMessageResponse>(
          this.iframe,
          event,
          ResponseEventType.GET_Y_COORDINATE_RESPONSE,
          (messageDetails) => {
            window.removeEventListener(COMMUNICATION_TYPE, listener);

            if (!messageDetails.success) {
              reject(new Error(messageDetails.error?.message));
            }

            resolve(messageDetails.data.yCoordinate);
          },
        );
      };
      window.addEventListener(COMMUNICATION_TYPE, listener);

      postRequestMessage<GetYCoordinateMessageRequest>(this.iframe, {
        type: RequestEventType.GET_Y_COORDINATE_REQUEST,
        details: { starkPublicKey: this.publicAddress },
      });
    });
  }
}

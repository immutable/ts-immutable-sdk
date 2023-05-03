import {
  ConfirmationResult,
  DisplayConfirmationParams,
  PassportEventType,
  ReceiveMessage,
  SendMessage,
  Transaction,
} from './types';
import { openPopupCenter } from './popup';
import { PassportConfiguration } from '../config';

const ConfirmationWindowTitle = 'Confirm this transaction';
const ConfirmationWindowHeight = 380;
const ConfirmationWindowWidth = 480;
const ConfirmationWindowClosedPollingDuration = 1000;

export default class ConfirmationScreen {
  private config: PassportConfiguration;

  constructor(config: PassportConfiguration) {
    this.config = config;
  }

  private postMessage(
    destinationWindow: Window,
    accessToken: string,
    message: DisplayConfirmationParams,
  ) {
    destinationWindow.postMessage(
      {
        eventType: PassportEventType,
        accessToken,
        ...message,
      },
      this.config.passportDomain,
    );
  }

  startTransaction(
    accessToken: string,
    transaction: Transaction,
    popupOptions?: { width: number; height: number },
  ): Promise<ConfirmationResult> {
    return new Promise((resolve, reject) => {
      const messageHandler = ({ data, origin }: MessageEvent) => {
        if (
          origin !== this.config.passportDomain
          || data.eventType !== PassportEventType
        ) {
          return;
        }
        switch (data.messageType as ReceiveMessage) {
          case ReceiveMessage.CONFIRMATION_WINDOW_READY: {
            // remove once fixed
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            this.postMessage(confirmationWindow, accessToken, {
              messageType: SendMessage.TRANSACTION_START,
              messageData: transaction,
            });
            break;
          }
          case ReceiveMessage.TRANSACTION_CONFIRMED: {
            resolve({ confirmed: true });
            break;
          }
          case ReceiveMessage.TRANSACTION_ERROR: {
            reject(new Error('Transaction error'));
            break;
          }
          default:
            reject(new Error('Unsupported message type'));
        }
      };

      window.addEventListener('message', messageHandler);
      const confirmationWindow = openPopupCenter({
        url: `${this.config.passportDomain}/transaction-confirmation`,
        title: ConfirmationWindowTitle,
        width: popupOptions?.width || ConfirmationWindowWidth,
        height: popupOptions?.height || ConfirmationWindowHeight,
      });

      // https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript/48240128#48240128
      const timer = setInterval(() => {
        if (confirmationWindow.closed) {
          clearInterval(timer);
          window.removeEventListener('message', messageHandler);
          resolve({ confirmed: false });
        }
      }, ConfirmationWindowClosedPollingDuration);
    });
  }
}

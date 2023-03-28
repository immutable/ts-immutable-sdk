import {
  ConfirmationResult,
  DisplayConfirmationParams,
  isReceiveMessage,
  PassportEventType,
  ReceiveMessage,
  SendMessage,
  Transaction
} from './types';
import { openPopupCenter } from './popup';
import { PassportConfiguration } from '../config';

export default class ConfirmationScreen {
  private config: PassportConfiguration;

  constructor(config: PassportConfiguration) {
    this.config = config;
  }

  private postMessage(accessToken: string, message: DisplayConfirmationParams) {
    window.postMessage({
      eventType: PassportEventType,
      accessToken,
      ...message,
    }, this.config.passportDomain);
  }

  startTransaction = (accessToken: string, transaction: Transaction): Promise<ConfirmationResult> => {
    return new Promise((resolve, reject) => {
      const messageHandler = ({ data, origin }: MessageEvent) => {
        if (origin != this.config.passportDomain || data.eventType != PassportEventType || !isReceiveMessage(data.messageType)) {
          return;
        }
        switch (data.messageType as ReceiveMessage) {
          case ReceiveMessage.CONFIRMATION_WINDOW_READY: {
            this.postMessage(accessToken, {
              messageType: SendMessage.TRANSACTION_START,
              messageData: transaction
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
            throw new Error('Unsupported message type');
        }
      };

      window.addEventListener('message', messageHandler);
      const confirmationWindow = openPopupCenter({
        url: `${this.config.passportDomain}/transaction-confirmation`,
        title: 'Confirm this transaction',
        width: 600,
        height: 600,
      });

      // https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript/48240128#48240128
      const timer = setInterval(function () {
        if (confirmationWindow.closed) {
          clearInterval(timer);
          window.removeEventListener('message', messageHandler);
          resolve({ confirmed: false });
        }
      }, 1000);
    });
  }
}

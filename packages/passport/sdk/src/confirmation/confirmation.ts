import {
  ConfirmationResult,
  DisplayConfirmationParams,
  PASSPORT_EVENT_TYPE,
  ReceiveMessage,
  SendMessage,
  Transaction,
} from './types';
import { openPopupCenter } from './popup';
import { PassportConfiguration } from '../config';

const CONFIRMATION_WINDOW_TITLE = 'Confirm this transaction';
const CONFIRMATION_WINDOW_HEIGHT = 380;
const CONFIRMATION_WINDOW_WIDTH = 480;
const CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION = 1000;

export default class ConfirmationScreen {
  private config: PassportConfiguration;

  private confirmationWindow: Window | undefined;

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
        eventType: PASSPORT_EVENT_TYPE,
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
          || data.eventType !== PASSPORT_EVENT_TYPE
        ) {
          return;
        }
        switch (data.messageType as ReceiveMessage) {
          case ReceiveMessage.CONFIRMATION_WINDOW_READY: {
            // TODO: remove once fixed
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
        title: CONFIRMATION_WINDOW_TITLE,
        width: popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
        height: popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
      });

      // https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript/48240128#48240128
      const timer = setInterval(() => {
        if (confirmationWindow.closed) {
          clearInterval(timer);
          window.removeEventListener('message', messageHandler);
          resolve({ confirmed: false });
        }
      }, CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION);
    });
  }

  startGuardianTransaction(
    transactionId: string,
    imxEtherAddress: string,
  ): Promise<ConfirmationResult> {
    return new Promise((resolve, reject) => {
      const messageHandler = ({ data, origin }: MessageEvent) => {
        if (
          origin !== this.config.passportDomain
          || data.eventType !== PASSPORT_EVENT_TYPE
        ) {
          return;
        }
        switch (data.messageType as ReceiveMessage) {
          case ReceiveMessage.CONFIRMATION_WINDOW_READY: {
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
      if (!this.confirmationWindow) {
        resolve({ confirmed: false });
        return;
      }
      // eslint-disable-next-line max-len
      this.confirmationWindow.location.href = `${this.config.passportDomain}/transaction-confirmation/transaction.html?transactionId=${transactionId}&imxEtherAddress=${imxEtherAddress}&chainType=starkex`;
      // https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript/48240128#48240128
      const timer = setInterval(() => {
        if (this.confirmationWindow?.closed) {
          clearInterval(timer);
          window.removeEventListener('message', messageHandler);
          resolve({ confirmed: false });
        }
      }, CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION);
    });
  }

  loading(popupOptions?: { width: number; height: number }) {
    this.confirmationWindow = openPopupCenter({
      url: `${this.config.passportDomain}/transaction-confirmation/loading.html`,
      title: CONFIRMATION_WINDOW_TITLE,
      width: popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
      height: popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
    });
  }

  closeWindow() {
    this.confirmationWindow?.close();
  }
}

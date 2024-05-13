import { TransactionApprovalRequestChainTypeEnum } from '@imtbl/guardian';
import {
  ConfirmationResult,
  PASSPORT_EVENT_TYPE,
  ReceiveMessage,
  SendMessage,
} from './types';
import { openPopupCenter } from './popup';
import { PassportConfiguration } from '../config';
import Overlay from '../overlay/overlay';

const CONFIRMATION_WINDOW_TITLE = 'Confirm this transaction';
const CONFIRMATION_WINDOW_HEIGHT = 720;
const CONFIRMATION_WINDOW_WIDTH = 480;
const CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION = 1000;

export const CONFIRMATION_IFRAME_ID = 'passport-confirm';
export const CONFIRMATION_IFRAME_STYLE = 'display: none; position: absolute;width:0px;height:0px;border:0;';

type MessageHandler = (arg0: MessageEvent) => void;

type PostMessageData = {
  eventType: string;
  messageType: SendMessage.CONFIRMATION_DATA_READY;
  path: string;
  query: { [key: string]: string };
};

const getPostMessageData = (relativePath: string, query: { [key: string]: string }): PostMessageData => ({
  eventType: PASSPORT_EVENT_TYPE,
  messageType: SendMessage.CONFIRMATION_DATA_READY,
  path: relativePath,
  query,
});

export default class ConfirmationScreen {
  private config: PassportConfiguration;

  private confirmationWindow: Window | undefined;

  private popupOptions: { width: number; height: number } | undefined;

  private overlay: Overlay | undefined;

  private overlayClosed: boolean;

  private timer: NodeJS.Timeout | undefined;

  constructor(config: PassportConfiguration) {
    this.config = config;
    this.overlayClosed = false;
  }

  private getHref(relativePath: string, queryStringParams?: { [key: string]: any }) {
    let href = `${this.config.passportDomain}/transaction-confirmation/${relativePath}`;

    if (queryStringParams) {
      const queryString = queryStringParams
        ? Object.keys(queryStringParams)
          .map((key) => `${key}=${queryStringParams[key]}`)
          .join('&')
        : '';

      href = `${href}?${queryString}`;
    }

    return href;
  }

  requestConfirmation(
    transactionId: string,
    etherAddress: string,
    chainType: TransactionApprovalRequestChainTypeEnum,
    chainId?: string,
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
            this.confirmationWindow?.postMessage({
              eventType: PASSPORT_EVENT_TYPE,
              messageType: SendMessage.CONFIRMATION_START,
            }, this.config.passportDomain);
            break;
          }
          case ReceiveMessage.TRANSACTION_CONFIRMED: {
            this.closeWindow();
            resolve({ confirmed: true });
            break;
          }
          case ReceiveMessage.TRANSACTION_ERROR: {
            this.closeWindow();
            reject(new Error('Error during transaction confirmation'));
            break;
          }
          case ReceiveMessage.TRANSACTION_REJECTED: {
            this.closeWindow();
            reject(new Error('User rejected transaction'));
            break;
          }
          default:
            this.closeWindow();
            reject(new Error('Unsupported message type'));
        }
      };

      let postMessageData;
      let href = '';
      if (chainType === TransactionApprovalRequestChainTypeEnum.Starkex) {
        href = this.getHref('transaction', { transactionId, etherAddress, chainType });
        postMessageData = getPostMessageData('transaction', { transactionId, etherAddress, chainType });
      } else {
        href = this.getHref('zkevm/transaction', {
          transactionID: transactionId, etherAddress, chainType, chainID: chainId,
        });
        postMessageData = getPostMessageData('zkevm/transaction', {
          transactionID: transactionId, etherAddress, chainType, chainID: chainId as string,
        });
      }
      window.addEventListener('message', messageHandler);
      this.showConfirmationScreen(href, postMessageData, messageHandler, resolve);
    });
  }

  requestMessageConfirmation(messageID: string, etherAddress: string): Promise<ConfirmationResult> {
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
            this.confirmationWindow?.postMessage({
              eventType: PASSPORT_EVENT_TYPE,
              messageType: SendMessage.CONFIRMATION_START,
            }, this.config.passportDomain);
            break;
          }
          case ReceiveMessage.MESSAGE_CONFIRMED: {
            this.closeWindow();
            resolve({ confirmed: true });
            break;
          }
          case ReceiveMessage.MESSAGE_ERROR: {
            this.closeWindow();
            reject(new Error('Error during message confirmation'));
            break;
          }
          case ReceiveMessage.MESSAGE_REJECTED: {
            this.closeWindow();
            reject(new Error('User rejected message'));
            break;
          }
          default:
            this.closeWindow();
            reject(new Error('Unsupported message type'));
        }
      };

      window.addEventListener('message', messageHandler);
      const href = this.getHref('zkevm/message', { messageID, etherAddress });
      const postMessageData = getPostMessageData('zkevm/message', { messageID, etherAddress });
      this.showConfirmationScreen(href, postMessageData, messageHandler, resolve);
    });
  }

  loading(popupOptions?: { width: number; height: number }) {
    if (this.config.crossSdkBridgeEnabled) {
      // There is no need to open a confirmation window if cross-sdk bridge is enabled
      return;
    }

    this.popupOptions = popupOptions;

    try {
      this.confirmationWindow = openPopupCenter({
        url: this.getHref('loading'),
        title: CONFIRMATION_WINDOW_TITLE,
        width: popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
        height: popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
      });
      this.overlay = new Overlay(this.config.popupOverlayOptions);
    } catch (e) {
      // If an error is thrown here then the popup is blocked
      this.overlay = new Overlay(this.config.popupOverlayOptions, true);
    }

    this.overlay.append(
      () => {
        try {
          this.confirmationWindow?.close();
          this.confirmationWindow = openPopupCenter({
            url: this.getHref('loading'),
            title: CONFIRMATION_WINDOW_TITLE,
            width: this.popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
            height: this.popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
          });
        } catch { /* Empty */ }
      },
      () => {
        this.overlayClosed = true;
        this.closeWindow();
      },
    );
  }

  closeWindow() {
    this.confirmationWindow?.close();
    this.overlay?.remove();
    this.overlay = undefined;
  }

  showConfirmationScreen(
    href: string,
    postMessageData: PostMessageData,
    messageHandler: MessageHandler,
    resolve: Function,
  ) {
    // If popup blocked, the confirmation window will not exist
    if (this.confirmationWindow) {
      this.confirmationWindow.postMessage(postMessageData, this.config.passportDomain);
    }

    // This indicates the user closed the overlay so the transaction should be rejected
    if (!this.overlay) {
      this.overlayClosed = false;
      resolve({ confirmed: false });
      return;
    }

    // https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript/48240128#48240128
    const timerCallback = () => {
      if (this.confirmationWindow?.closed || this.overlayClosed) {
        clearInterval(this.timer);
        window.removeEventListener('message', messageHandler);
        resolve({ confirmed: false });
        this.overlayClosed = false;
        this.confirmationWindow = undefined;
      }
    };
    this.timer = setInterval(
      timerCallback,
      CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION,
    );
    this.overlay.update(() => this.recreateConfirmationWindow(href, timerCallback));
  }

  private recreateConfirmationWindow(href: string, timerCallback: () => void) {
    try {
      // Clears and recreates the timer to ensure when the confirmation window
      // is closed and recreated the transaction is not rejected.
      clearInterval(this.timer);
      this.confirmationWindow?.close();
      this.confirmationWindow = openPopupCenter({
        url: href,
        title: CONFIRMATION_WINDOW_TITLE,
        width: this.popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
        height: this.popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
      });
      this.timer = setInterval(timerCallback, CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION);
    } catch { /* Empty */ }
  }
}

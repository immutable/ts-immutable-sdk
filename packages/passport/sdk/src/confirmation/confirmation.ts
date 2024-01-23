import { TransactionApprovalRequestChainTypeEnum } from '@imtbl/guardian';
import {
  ConfirmationResult,
  PASSPORT_EVENT_TYPE,
  ReceiveMessage,
} from './types';
import { openPopupCenter } from './popup';
import { PassportConfiguration } from '../config';

const CONFIRMATION_WINDOW_TITLE = 'Confirm this transaction';
const CONFIRMATION_WINDOW_HEIGHT = 720;
const CONFIRMATION_WINDOW_WIDTH = 480;
const CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION = 1000;

export const CONFIRMATION_IFRAME_ID = 'passport-confirm';
export const CONFIRMATION_IFRAME_STYLE = 'display: none; position: absolute;width:0px;height:0px;border:0;';

type MessageHandler = (arg0: MessageEvent) => void;

export default class ConfirmationScreen {
  private config: PassportConfiguration;

  private confirmationWindow: Window | undefined;

  constructor(config: PassportConfiguration) {
    this.config = config;
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
      if (!this.confirmationWindow) {
        resolve({ confirmed: false });
        return;
      }
      window.addEventListener('message', messageHandler);

      let href = '';
      if (chainType === TransactionApprovalRequestChainTypeEnum.Starkex) {
        href = this.getHref('transaction', { transactionId, etherAddress, chainType });
      } else {
        href = this.getHref('zkevm/transaction', {
          transactionID: transactionId, etherAddress, chainType, chainID: chainId,
        });
      }
      this.showConfirmationScreen(href, messageHandler, resolve);
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
            break;
          }
          case ReceiveMessage.MESSAGE_CONFIRMED: {
            resolve({ confirmed: true });
            break;
          }
          case ReceiveMessage.MESSAGE_REJECTED: {
            reject(new Error('Message rejected'));
            break;
          }

          default:
            reject(new Error('Unsupported message type'));
        }
      };
      if (!this.confirmationWindow) {
        resolve({ confirmed: false });
        return;
      }
      window.addEventListener('message', messageHandler);
      const href = this.getHref('zkevm/message', { messageID, etherAddress });
      this.showConfirmationScreen(href, messageHandler, resolve);
    });
  }

  loading(popupOptions?: { width: number; height: number }) {
    if (this.config.crossSdkBridgeEnabled) {
      // There is no need to open a confirmation window if cross-sdk bridge is enabled
      return;
    }

    this.confirmationWindow = openPopupCenter({
      url: this.getHref('loading'),
      title: CONFIRMATION_WINDOW_TITLE,
      width: popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
      height: popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
    });
  }

  closeWindow() {
    this.confirmationWindow?.close();
  }

  logout(): Promise<{ logout: boolean }> {
    return new Promise((resolve, rejects) => {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('id', CONFIRMATION_IFRAME_ID);
      iframe.setAttribute('src', this.getHref('logout'));
      iframe.setAttribute('style', CONFIRMATION_IFRAME_STYLE);
      const logoutHandler = ({ data, origin }: MessageEvent) => {
        if (
          origin !== this.config.passportDomain
          || data.eventType !== PASSPORT_EVENT_TYPE
        ) {
          return;
        }
        window.removeEventListener('message', logoutHandler);
        iframe.remove();

        if (data.messageType === ReceiveMessage.LOGOUT_SUCCESS) {
          resolve({ logout: true });
        }
        rejects(new Error('Unsupported logout type'));
      };

      window.addEventListener('message', logoutHandler);
      document.body.appendChild(iframe);
    });
  }

  showConfirmationScreen(href: string, messageHandler: MessageHandler, resolve: Function) {
    this.confirmationWindow!.location.href = href;
    // https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript/48240128#48240128
    const timer = setInterval(() => {
      if (this.confirmationWindow?.closed) {
        clearInterval(timer);
        window.removeEventListener('message', messageHandler);
        resolve({ confirmed: false });
      }
    }, CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION);
  }
}

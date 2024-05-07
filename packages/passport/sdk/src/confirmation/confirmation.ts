/* eslint-disable max-len */
import { TransactionApprovalRequestChainTypeEnum } from '@imtbl/guardian';
import {
  ConfirmationResult,
  PASSPORT_EVENT_TYPE,
  ReceiveMessage,
  SendMessage,
} from './types';
import { openPopupCenter } from './popup';
import { PassportConfiguration } from '../config';
import {
  getBlockedContents,
  getOverlay,
  getRefocusContents,
} from './overlay';

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

  private overlay: HTMLDivElement | undefined;

  private popupOptions: { width: number; height: number } | undefined;

  private tryAgainListener: (() => void) | undefined;

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
    let href = '';
    if (chainType === TransactionApprovalRequestChainTypeEnum.Starkex) {
      href = this.getHref('transaction', { transactionId, etherAddress, chainType });
    } else {
      href = this.getHref('zkevm/transaction', {
        transactionID: transactionId, etherAddress, chainType, chainID: chainId,
      });
    }

    // If we do not have a reference to the popup then create one
    if (!this.confirmationWindow) {
      try {
        this.confirmationWindow = openPopupCenter({
          url: href,
          title: CONFIRMATION_WINDOW_TITLE,
          width: this.popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
          height: this.popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
        });
      } catch {
        this.appendOverlay(href, true);
      }
    }

    if (this.overlay) {
      this.updateTryAgainButton(href);
    } else {
      this.appendOverlay(href, false);
    }

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
            resolve({ confirmed: true });
            break;
          }
          case ReceiveMessage.TRANSACTION_ERROR: {
            reject(new Error('Error during transaction confirmation'));
            break;
          }
          case ReceiveMessage.TRANSACTION_REJECTED: {
            reject(new Error('User rejected transaction'));
            break;
          }
          default:
            reject(new Error('Unsupported message type'));
        }
      };

      window.addEventListener('message', messageHandler);
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
            this.confirmationWindow?.postMessage({
              eventType: PASSPORT_EVENT_TYPE,
              messageType: SendMessage.CONFIRMATION_START,
            }, this.config.passportDomain);
            break;
          }
          case ReceiveMessage.MESSAGE_CONFIRMED: {
            resolve({ confirmed: true });
            break;
          }
          case ReceiveMessage.MESSAGE_ERROR: {
            reject(new Error('Error during message confirmation'));
            break;
          }
          case ReceiveMessage.MESSAGE_REJECTED: {
            reject(new Error('User rejected message'));
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
    console.log('loading is called');
    if (this.config.crossSdkBridgeEnabled) {
      // There is no need to open a confirmation window if cross-sdk bridge is enabled
      return;
    }

    this.popupOptions = popupOptions;

    try {
      // confirmationWindow need to call close on in try again, then reopen
      this.confirmationWindow = openPopupCenter({
        url: this.getHref('loading'),
        title: CONFIRMATION_WINDOW_TITLE,
        width: popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
        height: popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
      });
      this.appendOverlay(this.getHref('loading'), false);
    } catch (e) {
      // The popup is blocked
      this.appendOverlay(this.getHref('loading'), true);
    }
  }

  closeWindow() {
    this.confirmationWindow?.close();
    this.overlay?.remove();
  }

  showConfirmationScreen(href: string, messageHandler: MessageHandler, resolve: Function) {
    if (this.confirmationWindow) {
      this.confirmationWindow.location.href = href; // update confirmation window before calling close on old window
    }

    // https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript/48240128#48240128
    const timer = setInterval(() => {
      if (this.confirmationWindow?.closed) {
        clearInterval(timer);
        window.removeEventListener('message', messageHandler);
        resolve({ confirmed: false });
      }
    }, CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION);
  }

  appendOverlay(href: string, showBlockedContents: boolean) {
    if (this.overlay) {
      this.overlay.remove();
    }

    const overlay = document.createElement('div');

    overlay.innerHTML = getOverlay(
      showBlockedContents ? getBlockedContents() : getRefocusContents(),
    );

    document.body.insertAdjacentElement('beforeend', overlay);
    this.overlay = overlay;

    this.tryAgainListener = () => this.recreateConfirmationWindow(href);

    // This brief timeout ensures the buttons exist before attaching the event listener
    setTimeout(() => {
      const tryAgainButton = overlay.querySelector('.passport-overlay-try-again');
      if (tryAgainButton && this.tryAgainListener) {
        tryAgainButton.addEventListener('click', this.tryAgainListener);
      }
      const closeButton = overlay.querySelector('.passport-overlay-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          this.confirmationWindow?.close();
          this.overlay?.remove();
        });
      }
    }, 0);
  }

  updateTryAgainButton(href: string) {
    const tryAgainButton = this.overlay?.querySelector('.passport-overlay-try-again');
    if (tryAgainButton && this.tryAgainListener) {
      tryAgainButton.removeEventListener('click', this.tryAgainListener);
      this.tryAgainListener = () => this.recreateConfirmationWindow(href);
      tryAgainButton.addEventListener('click', this.tryAgainListener);
    }
  }

  removeOverlay = () => {
    this.overlay?.remove();
  };

  private recreateConfirmationWindow(href: string) {
    try {
      /*
       * Need to obtain a reference to the current this.confirmationWindow to close the window after
       * recreating the popup. This ensures that the timer that detects the popup close does not
       * reject the transaction. The purpose of recreating the popup entirely is because the focus()
       * method is not a reliable way to bring the popup to the front.
      */
      const previousWindow = this.confirmationWindow;
      this.confirmationWindow = openPopupCenter({
        url: href,
        title: CONFIRMATION_WINDOW_TITLE,
        width: this.popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
        height: this.popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
      });
      previousWindow?.close();
    } catch (e) {
      this.appendOverlay(href, true);
    }
  }
}

/**
 * Confirmation screen component
 * Handles popup windows for transaction and message confirmations
 */

import {
  ConfirmationResult,
  PASSPORT_CONFIRMATION_EVENT_TYPE,
  ConfirmationReceiveMessage,
  ConfirmationSendMessage,
  MessageType,
} from './types';
import { openPopupCenter } from './popup';
import { ConfirmationOverlay, type PopupOverlayOptions } from './overlay';

const CONFIRMATION_WINDOW_TITLE = 'Confirm this transaction';
const CONFIRMATION_WINDOW_HEIGHT = 720;
const CONFIRMATION_WINDOW_WIDTH = 480;
const CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION = 1000;

type MessageHandler = (arg0: MessageEvent) => void;

export interface ConfirmationScreenConfig {
  /** Passport domain for confirmation URLs */
  passportDomain: string;
  /** Overlay options */
  popupOverlayOptions?: PopupOverlayOptions;
}

/**
 * Confirmation screen component
 */
export class ConfirmationScreen {
  private config: ConfirmationScreenConfig;
  private confirmationWindow: Window | undefined;
  private popupOptions: { width: number; height: number } | undefined;
  private overlay: ConfirmationOverlay | undefined;
  private overlayClosed: boolean;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(config: ConfirmationScreenConfig) {
    this.config = config;
    this.overlayClosed = false;
  }

  private getHref(relativePath: string, queryStringParams?: { [key: string]: any }) {
    let href = `${this.config.passportDomain}/transaction-confirmation/${relativePath}`;

    if (queryStringParams) {
      const queryString = Object.keys(queryStringParams)
        .map((key) => `${key}=${queryStringParams[key]}`)
        .join('&');
      href = `${href}?${queryString}`;
    }

    return href;
  }

  /**
   * Request confirmation for a transaction
   */
  requestConfirmation(
    transactionId: string,
    etherAddress: string,
    chainId: string,
  ): Promise<ConfirmationResult> {
    return new Promise((resolve, reject) => {
      const messageHandler = ({ data, origin }: MessageEvent) => {
        if (
          origin !== this.config.passportDomain
          || data.eventType !== PASSPORT_CONFIRMATION_EVENT_TYPE
        ) {
          return;
        }

        switch (data.messageType as ConfirmationReceiveMessage) {
          case ConfirmationReceiveMessage.CONFIRMATION_WINDOW_READY: {
            this.confirmationWindow?.postMessage({
              eventType: PASSPORT_CONFIRMATION_EVENT_TYPE,
              messageType: ConfirmationSendMessage.CONFIRMATION_START,
            }, this.config.passportDomain);
            break;
          }
          case ConfirmationReceiveMessage.TRANSACTION_CONFIRMED: {
            this.closeWindow();
            resolve({ confirmed: true });
            break;
          }
          case ConfirmationReceiveMessage.TRANSACTION_REJECTED: {
            this.closeWindow();
            resolve({ confirmed: false });
            break;
          }
          case ConfirmationReceiveMessage.TRANSACTION_ERROR: {
            this.closeWindow();
            reject(new Error('Error during transaction confirmation'));
            break;
          }
          default:
            this.closeWindow();
            reject(new Error('Unsupported message type'));
        }
      };

      const href = this.getHref('zkevm/transaction', {
        transactionID: transactionId,
        etherAddress,
        chainType: 'evm',
        chainID: chainId,
      });
      window.addEventListener('message', messageHandler);
      this.showConfirmationScreen(href, messageHandler, resolve);
    });
  }

  /**
   * Request confirmation for a message
   */
  requestMessageConfirmation(
    messageID: string,
    etherAddress: string,
    messageType?: MessageType,
  ): Promise<ConfirmationResult> {
    return new Promise((resolve, reject) => {
      const messageHandler = ({ data, origin }: MessageEvent) => {
        if (
          origin !== this.config.passportDomain
          || data.eventType !== PASSPORT_CONFIRMATION_EVENT_TYPE
        ) {
          return;
        }
        switch (data.messageType as ConfirmationReceiveMessage) {
          case ConfirmationReceiveMessage.CONFIRMATION_WINDOW_READY: {
            this.confirmationWindow?.postMessage({
              eventType: PASSPORT_CONFIRMATION_EVENT_TYPE,
              messageType: ConfirmationSendMessage.CONFIRMATION_START,
            }, this.config.passportDomain);
            break;
          }
          case ConfirmationReceiveMessage.MESSAGE_CONFIRMED: {
            this.closeWindow();
            resolve({ confirmed: true });
            break;
          }
          case ConfirmationReceiveMessage.MESSAGE_REJECTED: {
            this.closeWindow();
            resolve({ confirmed: false });
            break;
          }
          case ConfirmationReceiveMessage.MESSAGE_ERROR: {
            this.closeWindow();
            reject(new Error('Error during message confirmation'));
            break;
          }
          default:
            this.closeWindow();
            reject(new Error('Unsupported message type'));
        }
      };

      window.addEventListener('message', messageHandler);
      const href = this.getHref('zkevm/message', {
        messageID,
        etherAddress,
        ...(messageType ? { messageType } : {}),
      });
      this.showConfirmationScreen(href, messageHandler, resolve);
    });
  }

  /**
   * Show loading screen
   */
  loading(popupOptions?: { width: number; height: number }) {
    this.popupOptions = popupOptions;

    try {
      this.confirmationWindow = openPopupCenter({
        url: this.getHref('loading'),
        title: CONFIRMATION_WINDOW_TITLE,
        width: popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
        height: popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
      });
      this.overlay = new ConfirmationOverlay(
        this.config.popupOverlayOptions || {},
        false
      );
    } catch (error) {
      // If an error is thrown here then the popup is blocked
      this.overlay = new ConfirmationOverlay(
        this.config.popupOverlayOptions || {},
        true
      );
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

  /**
   * Close the confirmation window
   */
  closeWindow() {
    this.confirmationWindow?.close();
    this.overlay?.remove();
    this.overlay = undefined;
  }

  /**
   * Show confirmation screen
   */
  private showConfirmationScreen(href: string, messageHandler: MessageHandler, resolve: Function) {
    // If popup blocked, the confirmation window will not exist
    if (this.confirmationWindow) {
      this.confirmationWindow.location.href = href;
    }

    // This indicates the user closed the overlay so the transaction should be rejected
    if (!this.overlay) {
      this.overlayClosed = false;
      resolve({ confirmed: false });
      return;
    }

    // Poll for window close
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

  /**
   * Recreate confirmation window
   */
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


import { TransactionApprovalRequestChainTypeEnum } from '@imtbl/guardian';
import {
  ConfirmationResult,
  PASSPORT_EVENT_TYPE,
  ReceiveMessage,
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

  private overlay: HTMLDivElement | undefined;

  constructor(config: PassportConfiguration) {
    this.config = config;
  }

  appendOverlay(href: string) {
    // Potential scenarios:
    // 1. Have overlay & loading popup: Handles all situations (e.g. loading popup would be blocked), relies on overlay the least, although available when required.
    // 2. Have overlay without loading popup: Handles all situations. May result in *more* usage of overlay as some situations may not have blocked loading popup, but do block transaction confirmation screen.
    // 3. No overlay: Not all situations are handled. If dApp performs too many operations before calling eth_sendTransaction, the popup may be blocked (loading or transaction confirmation).

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.position = 'fixed';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
    overlay.style.zIndex = '9999';

    const container = document.createElement('div');
    container.className = 'container';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.height = '100%';
    container.style.width = '500px';

    const text = document.createElement('p');
    text.style.color = 'white';
    text.innerText = 'Don\'t see the secure confirmation window? We\'ll help you re-launch the window to complete your purchase.';

    // Create the close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'Continue';
    closeButton.style.width = 'fit-content';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.textDecorationLine = 'underline';

    // Add event listener to close the overlay
    closeButton.addEventListener('click', () => {
      if (this.confirmationWindow) {
        this.confirmationWindow.focus();
      } else {
        this.confirmationWindow = openPopupCenter({
          url: href,
          title: CONFIRMATION_WINDOW_TITLE,
          width: CONFIRMATION_WINDOW_WIDTH,
          height: CONFIRMATION_WINDOW_HEIGHT,
        });
      }
    });

    overlay.appendChild(container);
    container.appendChild(text);
    container.appendChild(closeButton);

    // Append overlay to the body
    document.body.insertAdjacentElement('beforeend', overlay);
    this.overlay = overlay;
  }

  requestConfirmation(
    transactionId: string,
    imxEtherAddress: string,
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
      window.addEventListener('message', messageHandler);

      let href = '';
      if (chainType === TransactionApprovalRequestChainTypeEnum.Starkex) {
        // eslint-disable-next-line max-len
        href = `${this.config.passportDomain}/transaction-confirmation/transaction?transactionId=${transactionId}&imxEtherAddress=${imxEtherAddress}&chainType=starkex`;
      } else {
        // eslint-disable-next-line max-len
        href = `${this.config.passportDomain}/transaction-confirmation/zkevm?transactionId=${transactionId}&imxEtherAddress=${imxEtherAddress}&chainType=evm&chainId=${chainId}`;
      }
      if (this.confirmationWindow) {
        this.confirmationWindow.location.href = href;
      }
      this.appendOverlay(href);
      // https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript/48240128#48240128
      const timer = setInterval(() => {
        if (this.confirmationWindow?.closed) {
          clearInterval(timer);
          window.removeEventListener('message', messageHandler);
          if (this.overlay) {
            document.body.removeChild(this.overlay);
            this.overlay = undefined;
          }
          this.confirmationWindow = undefined;
          resolve({ confirmed: false });
        }
      }, CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION);
    });
  }

  loading(popupOptions?: { width: number; height: number }) {
    // if (this.config.crossSdkBridgeEnabled) {
    //   // There is no need to open a confirmation window if cross-sdk bridge is enabled
    //   return;
    // }

    // this.confirmationWindow = openPopupCenter({
    //   url: `${this.config.passportDomain}/transaction-confirmation/loading`,
    //   title: CONFIRMATION_WINDOW_TITLE,
    //   width: popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
    //   height: popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
    // });
  }

  closeWindow() {
    this.confirmationWindow?.close();
    this.confirmationWindow = undefined;
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay = undefined;
    }
  }
}

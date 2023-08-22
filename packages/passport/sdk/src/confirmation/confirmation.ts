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

  constructor(config: PassportConfiguration) {
    this.config = config;
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
      if (!this.confirmationWindow) {
        resolve({ confirmed: false });
        return;
      }

      let href = '';
      if (chainType === TransactionApprovalRequestChainTypeEnum.Starkex) {
        // eslint-disable-next-line max-len
        href = `${this.config.passportDomain}/transaction-confirmation/transaction.html?transactionId=${transactionId}&imxEtherAddress=${imxEtherAddress}&chainType=starkex`;
      } else {
        // eslint-disable-next-line max-len
        href = `${this.config.passportDomain}/transaction-confirmation/zkevm?transactionId=${transactionId}&imxEtherAddress=${imxEtherAddress}&chainType=evm&chainId=${chainId}`;
      }
      this.confirmationWindow.location.href = href;
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
    if (this.config.crossSdkBridgeEnabled) {
      // There is no need to open a confirmation window if cross-sdk bridge is enabled
      return;
    }

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

import {
  ConfirmationResult,
  DisplayConfirmationParams,
  isReceiveMessageType,
  PostMessageParams,
  ReceiveMessage
} from './types';
import { ConfirmationTitle, PopUpHeight, PopUpWidth } from './config';
import { openPopupCenter } from './popup';

export const passportConfirmationType = "imx-passport-confirmation";

export default async function displayConfirmationScreen(params: DisplayConfirmationParams): Promise<ConfirmationResult> {
  return new Promise((resolve, reject) => {
    const confirmationWindow = openPopupCenter({
      url: params.passportDomain,
      title: ConfirmationTitle,
      width: PopUpWidth,
      height: PopUpHeight
    });

    // https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript/48240128#48240128
    const timer = setInterval(function () {
      if (confirmationWindow?.closed) {
        clearInterval(timer);
        window.removeEventListener("message", messageHandler);
        resolve({ confirmed: false });
      }
    }, 1000);

    const messageHandler = ({ data, origin }: MessageEvent) => {
      if (origin != params.passportDomain || data.eventType != passportConfirmationType || isReceiveMessageType(data.messageType)) {
        return;
      }
      switch (data.messageType as ReceiveMessage) {
        case "confirmation_window_ready": {
          if (!confirmationWindow) {
            return;
          }
          PassportPostMessage(confirmationWindow, {
            ...params,
            eventType: passportConfirmationType
          }, params.passportDomain);
          break;
        }
        case 'transaction_confirmed': {
          resolve({ confirmed: true });
          break;
        }
        case 'transaction_error': {
          reject(new Error("Transaction rejected"));
          break;
        }
        default:
          throw new Error('Unsupported message type');
      }
    };
    window.addEventListener("message", messageHandler);
  });
}

const PassportPostMessage = (window: Window, message: PostMessageParams, targetDomain: string) => {
  window.postMessage(message, targetDomain);
};

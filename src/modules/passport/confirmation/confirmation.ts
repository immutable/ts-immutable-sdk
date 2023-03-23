import {
  ConfirmationResult,
  DisplayConfirmationParams,
  isReceiveMessageType,
  PostMessageParams,
  ReceiveMessage
} from './types';
import { ConfirmationTitle, passportConfirmationType, PopUpHeight, PopUpWidth } from './config';
import { openPopupCenter } from './popup';

export const displayConfirmationScreen = async (params: DisplayConfirmationParams): Promise<ConfirmationResult> => {
  return new Promise((resolve) => {
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
        resolve({ confirmed: false });
      }
    }, 1000);

    const messageHandler = ({ data, origin }: MessageEvent) => {
      if (origin != params.passportDomain || data.eventType != passportConfirmationType || isReceiveMessageType(data.messageType)) {
        return ({ confirmed: false });
      }
      switch (data.messageType as ReceiveMessage) {
        case "confirmation_window_ready": {
          if (!confirmationWindow) {
            return;
          }
          PassportPostMessage(confirmationWindow, { ...params, eventType: passportConfirmationType });
          break;
        }
        case 'transaction_confirmed': {
          resolve({ confirmed: true });
          break;
        }
        case 'transaction_error': {
          resolve({ confirmed: false });
          break;
        }
        default:
          throw new Error('Unsupported message type');
      }
    };
    window.addEventListener("message", messageHandler);
  });
};

const PassportPostMessage = (window: Window, message: PostMessageParams) => {
  window.postMessage(message, "*");
};



import {
  ConfirmationResult,
  DisplayConfirmationParams,
  isReceiveMessageType,
  PostMessageParams,
  ReceiveMessage
} from './types';
import { ConfirmationDomain, ConfirmationDomainURL, ConfirmationTitle, PopUpHeight, PopUpWidth } from './config';
import { openPopupCenter } from './popup';


export const displayConfirmationScreen = async (params: DisplayConfirmationParams): Promise<ConfirmationResult> => {
  return new Promise((resolve) => {
    const confirmationWindow = openPopupCenter({
      url: ConfirmationDomainURL,
      title: ConfirmationTitle,
      width: PopUpWidth,
      height: PopUpHeight
    });

    const messageHandler = ({ data, origin }: MessageEvent) => {
      if (origin != ConfirmationDomain || data.eventType != "imx-passport-confirmation" || isReceiveMessageType(data.messageType)) {
        return ({ confirmed: false });
      }
      switch (data.messageType as ReceiveMessage) {
        case "imx-passport-confirmation-ready": {
          if (!confirmationWindow) {
            return;
          }
          PassportPostMessage(confirmationWindow, { ...params, eventType: "imx-passport-confirmation" });
          break;
        }
        case 'transaction_confirmed': {
          if (data.messageData.success) {
            resolve({ confirmed: true });
            break;
          }
          resolve({ confirmed: false });
          break;
        }
        case 'transaction_error': {
          resolve({ confirmed: false });
          break;
        }
        case 'confirmation_window_close': {
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



const displayConfirmationScreen = async (params: DisplayConfirmationParams): Promise<ConfirmationResult> => {
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
        case "confirmation_window_ready": {
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

type PopUpProps = { url: string; title: string; width: number; height: number; query?: string }
const openPopupCenter = ({ url, title, width, height }: PopUpProps): Window | null => {
  // Fixes dual-screen position                             Most browsers      Firefox
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const windowWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  const windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

  const systemZoom = windowWidth / window.screen.availWidth;
  const left = (windowWidth - width) / 2 / systemZoom + dualScreenLeft;
  const top = (windowHeight - height) / 2 / systemZoom + dualScreenTop;
  const newWindow = window.open(url, title,
    `
      scrollbars=yes,
      width=${width / systemZoom}, 
      height=${height / systemZoom}, 
      top=${top}, 
      left=${left}
     `
  );
  if (newWindow) {
    newWindow.focus();
  }
  return newWindow;
};


import { GetSignableTradeRequest, GetSignableTransferRequest } from '@imtbl/core-sdk';


const ReceiveMessageType = ['confirmation_window_ready', 'transaction_confirmed', 'transaction_error', 'confirmation_window_close'] as const;
type ReceiveTypeTuple = typeof ReceiveMessageType;
type ReceiveMessage = ReceiveTypeTuple[number];

function isReceiveMessageType(value: string): value is ReceiveMessage {
  return ReceiveMessageType.includes(value as ReceiveMessage);
}

type PostMessageData = {
  transactionType: TransactionType;
  transactionData: TransactionPayloadType;
}

type DisplayConfirmationParams = {
  messageType: PostMessageType;
  messageData: PostMessageData;
  accessToken: string;
}

type PostMessageParams = DisplayConfirmationParams & {
  eventType: PassportEventType;
}

type ConfirmationResult = {
  confirmed: boolean;
}

type TransactionPayloadType = GetSignableTransferRequest | GetSignableTradeRequest
type TransactionType = "v1/transfer" | "order"

type PostMessageType = "transaction_start"
type PassportEventType = "imx-passport-confirmation";


const ConfirmationTitle = "Confirm this transaction";
const PopUpWidth = 350;
const PopUpHeight = 350;


const ConfirmationDomainURL = "http://localhost:3000/transaction-confirmation";
const ConfirmationDomain = "http://localhost:3000";




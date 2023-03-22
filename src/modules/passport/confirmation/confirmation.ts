import { GetSignableTradeRequest, GetSignableTransferRequest } from '@imtbl/core-sdk';

const ConfirmationDomainURL = "http://localhost:3000/transaction-confirmation"
const ConfirmationDomain = "http://localhost:3000"

const ConfirmationTitle = "Confirm this transaction";
const PopUpWidth = 350;
const PopUpHeight = 350;

const ConfirmationReadyMessageType = "ready";
const ConfirmationFinishMessageType = "transaction_confirmed";

type TransactionPayloadType = GetSignableTransferRequest | GetSignableTradeRequest
type TransactionType = "v1/transfer" | "order"

type PostMessageType = "transaction_start"
type PassportEventType = "imx-passport";

type PostMessageData = {
  transactionType: TransactionType;
  transactionData: TransactionPayloadType;
}


type DisplayConfirmationParams = {
  messageType: PostMessageType;
  messageData: PostMessageData;
}

type PostMessageParams = DisplayConfirmationParams & {
  eventType: PassportEventType;
}

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


type ConfirmationResult = {
  confirmed: boolean;
}
export const displayConfirmationScreen = async (params: DisplayConfirmationParams): Promise<ConfirmationResult> => {
  return new Promise((resolve) => {
    const confirmationWindow = openPopupCenter({
      url: ConfirmationDomainURL,
      title: ConfirmationTitle,
      width: PopUpWidth,
      height: PopUpHeight
    });

    const onConfirmationWindowReady = ({ data, origin }: MessageEvent) => {
      if (origin != ConfirmationDomain || data.eventType != "imx-passport" || data.messageType != ConfirmationReadyMessageType) {
        return;
      }
      if (!confirmationWindow) {
        return;
      }
      window.removeEventListener("message", onConfirmationWindowReady);
      PassportPostMessage(confirmationWindow, { ...params, eventType: "imx-passport" });
    };

    window.removeEventListener("message", onConfirmationWindowReady);


    // Handle messages posted from confirmation screen
    window.addEventListener("message", ({ data, origin }: MessageEvent) => {
      if (origin != ConfirmationDomain || data.eventType != "imx-passport" || data.messageType != ConfirmationFinishMessageType) {
        return;
      }
      const { messageData } = data;
      console.log('parent received msg: ', data);
      if (messageData.success) {
        resolve({ confirmed: true });
      }
      resolve({ confirmed: false });
    });
  });
};

const PassportPostMessage = (window: Window, message: PostMessageParams) => {
  window.postMessage(message, "*");
};

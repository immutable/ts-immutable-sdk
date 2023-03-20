import { GetSignableTransferRequest } from '@imtbl/core-sdk';

const ConfirmationDomain = "";
const ConfirmationTitle = "Confirm this transaction";
const PopUpWidth = 350;
const PopUpHeight = 350;

type ConfirmationPayloadType = GetSignableTransferRequest

type DisplayConfirmationParams = {
  type: "transfer" | "order" | "purchase";
  data: ConfirmationPayloadType;
}


type ConfirmationResult = {
  confirmed: boolean;
}
export const displayConfirmationScreen = async (params: DisplayConfirmationParams): Promise<ConfirmationResult> => {
  return new Promise((resolve) => {
    const encodedQueryData = jsonToBase64(params);
    openPopupCenter({
      url: ConfirmationDomain,
      query: encodedQueryData,
      title: ConfirmationTitle,
      width: PopUpWidth,
      height: PopUpHeight
    });

    // Handle messages posted from confirmation screen
    window.addEventListener("message", ({ data, origin }) => {
      if (origin != ConfirmationDomain) {
        return;
      }
      const { type, success } = data;
      if (type !== 'passport-confirmation') return;
      console.log('parent received msg: ', data);
      if (success) {
        resolve({ confirmed: true });
      }
      resolve({ confirmed: false });
    });
  });
};


type PopUpProps = { url: string; title: string; width: number; height: number; query?: string }
const openPopupCenter = ({ url, title, query, width, height }: PopUpProps) => {
  // Fixes dual-screen position                             Most browsers      Firefox
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const windowWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  const windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

  const systemZoom = windowWidth / window.screen.availWidth;
  const left = (windowWidth - width) / 2 / systemZoom + dualScreenLeft;
  const top = (windowHeight - height) / 2 / systemZoom + dualScreenTop;
  const newWindow = window.open(`${url}?${query}`, title,
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
};

const jsonToBase64 = (data: object): string => {
  const json = JSON.stringify(data);
  return Buffer.from(json).toString("base64");
};
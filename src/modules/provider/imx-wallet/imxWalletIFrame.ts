import { ENVIRONMENTS } from './constants'; // todo: determine if we want to handle envs the same

export const IMX_WALLET_IFRAME_ID = 'imx-wallet-app';
export const IMX_WALLET_IFRAME_HOSTS = {
  [ENVIRONMENTS.DEVELOPMENT]: 'http://localhost:8080',
  [ENVIRONMENTS.STAGING]: 'https://wallets.sandbox.immutable.com',
  [ENVIRONMENTS.PRODUCTION]: 'https://wallets.immutable.com',
};
export const IMX_WALLET_IFRAME_STYLE = 'display: none;';

export function getIFrame(): HTMLIFrameElement | null {
  return document.querySelector(`iframe#${IMX_WALLET_IFRAME_ID}`);
}

function resetIFrame(): void {
  const iFrame = getIFrame();

  if (iFrame) {
    iFrame.remove();
  }
}

// todo: where do we want to use this?
export async function setupIFrame(env: ENVIRONMENTS): Promise<void> {
  return new Promise((resolve) => {
    resetIFrame();

    const iframe = document.createElement('iframe');

    iframe.setAttribute('id', IMX_WALLET_IFRAME_ID);
    iframe.setAttribute('src', IMX_WALLET_IFRAME_HOSTS[env]);
    iframe.setAttribute('style', IMX_WALLET_IFRAME_STYLE);

    document.body.appendChild(iframe);

    iframe.onload = () => resolve();
  });
}

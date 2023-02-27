import { ENVIRONMENTS } from '../../constants';
import { addLog } from '../../utils/logs';

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

export async function setupIFrame(
  env: ENVIRONMENTS,
): Promise<void> {
  addLog('sdk', 'setupIFrame');

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

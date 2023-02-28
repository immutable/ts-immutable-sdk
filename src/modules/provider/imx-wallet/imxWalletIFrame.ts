import { ENVIRONMENTS } from '../constants'; // todo: determine if we want to handle envs the same

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

export async function setupIFrame(
  env: ENVIRONMENTS
): Promise<HTMLIFrameElement> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');

    iframe.setAttribute('id', IMX_WALLET_IFRAME_ID);
    iframe.setAttribute('src', IMX_WALLET_IFRAME_HOSTS[env]);
    iframe.setAttribute('style', IMX_WALLET_IFRAME_STYLE);

    document.body.appendChild(iframe);

    iframe.onload = () => resolve(iframe);
  });
}

export async function getOrSetIframe(
  env: ENVIRONMENTS
): Promise<HTMLIFrameElement> {
  const iframe = getIFrame();
  if (iframe) return iframe;
  return await setupIFrame(env);
}

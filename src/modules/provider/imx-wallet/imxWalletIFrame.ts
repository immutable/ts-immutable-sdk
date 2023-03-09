import { Environment } from 'config';

export const IMX_WALLET_IFRAME_ID = 'imx-wallet-app';
export const IMX_WALLET_IFRAME_HOSTS = {
  [Environment.DEVELOPMENT]: 'http://localhost:8080',
  [Environment.SANDBOX]: 'https://wallets.sandbox.immutable.com',
  [Environment.PRODUCTION]: 'https://wallets.immutable.com',
};
export const IMX_WALLET_IFRAME_STYLE = 'display: none;';

export function getIFrame(): HTMLIFrameElement | null {
  return document.querySelector(`iframe#${IMX_WALLET_IFRAME_ID}`);
}

export async function setupIFrame(
  env: Environment
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

export async function getOrSetupIFrame(
  env: Environment
): Promise<HTMLIFrameElement> {
  const iframe = getIFrame();
  if (iframe) return iframe;
  return await setupIFrame(env);
}

import { getIFrame } from './imxWalletIFrame';

export const htmlBodyInit = () => { document.body.innerHTML = '<body></body>'; };

export function triggerIFrameOnLoad(): HTMLIFrameElement | null {
  const iFrame = getIFrame();

  if (iFrame && iFrame.onload) {
    iFrame.onload(new Event('Loaded'));
  }

  return iFrame;
}

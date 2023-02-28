import { getIFrame } from './imxWalletIFrame';

export const htmlBodyInit = () => {
  document.body.innerHTML = '<body></body>';
};

export function triggerIframeOnLoad() {
  const iFrame = getIFrame();

  if (iFrame && iFrame.onload) {
    iFrame.onload(new Event('Loaded'));
  }
}

export async function asyncTriggerIframeOnLoad<T>(
  promise: Promise<T>
): Promise<T> {
  triggerIframeOnLoad();
  return promise;
}

import { getIFrame } from './imxWalletIFrame';

export const htmlBodyInit = () => {
  document.body.innerHTML = '<body></body>';
};

export function triggerIFrameOnLoad() {
  const iFrame = getIFrame();

  if (iFrame && iFrame.onload) {
    iFrame.onload(new Event('Loaded'));
  }
}

export async function asyncTriggerIFrameOnLoad<T>(
  promise: Promise<T>
): Promise<T> {
  triggerIFrameOnLoad();
  return promise;
}

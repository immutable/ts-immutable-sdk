import { Web3Provider } from '@ethersproject/providers';
import { CheckoutWidgetTagNames } from '../../definitions/types';

export function SetProvider(
  tagName: CheckoutWidgetTagNames,
  provider: Web3Provider | null,
) {
  if (!provider) {
    // eslint-disable-next-line no-console
    console.error('no provider parsed');
    return;
  }

  let attempts = 0;
  const maxAttempts = 10;
  let timer: number;

  const attemptToSetProvider = () => {
    try {
      const elements = document.getElementsByTagName(tagName);
      const widget = elements[0] as unknown as ImmutableWebComponent;
      widget.setProvider(provider);
      window.clearInterval(timer);
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
        // eslint-disable-next-line no-console
        console.error('failed to set the provider');
      }
    }
  };

  timer = window.setInterval(attemptToSetProvider, 10);
  attemptToSetProvider();
}

import { Web3Provider } from '@ethersproject/providers';
import { CheckoutWidgetsConfig } from './definitions/config';
import { CheckoutWidgetTagNames } from './definitions/types';

/**
 * CheckoutWidgets allows to inject the Checkout Widgets into your application.
 * @param {CheckoutWidgetsConfig|undefined} config - Checkout Widget global configurations.
 */
export function CheckoutWidgets(config?: CheckoutWidgetsConfig) {
  const checkoutWidgetJS = document.createElement('script');

  checkoutWidgetJS.setAttribute(
    'src',
    'http://localhost:3000/lib/js/imtbl-checkout.js',
  );

  document.head.appendChild(checkoutWidgetJS);
  window.ImtblCheckoutWidgetConfig = JSON.stringify(config);
}

/**
 * UpdateConfig allows to update the configuration of an existing Checkout Widgets instance.
 * @param {CheckoutWidgetsConfig} config - new Checkout Widget global configurations.
 */
export function UpdateConfig(config: CheckoutWidgetsConfig) {
  window.ImtblCheckoutWidgetConfig = JSON.stringify(config);
}

/**
 * SetProvider allows to set the provider for an existing Checkout Widgets instance.
 * @param {CheckoutWidgetTagNames} tagName - target Checkout Widget widget.
 * @param {Web3Provider} provider - the provider to connect to the blockchain network.
 */
export function SetProvider(
  tagName: CheckoutWidgetTagNames,
  provider: Web3Provider | null,
) {
  if (!provider) {
    // eslint-disable-next-line no-console
    console.error('no provider parsed');
    return;
  }
  const elements = document.getElementsByTagName(tagName);

  const widget = elements[0] as unknown as ImmutableWebComponent;

  let attempts = 0;
  const maxAttempts = 10;
  let timer: number;

  const attemptToSetProvider = () => {
    try {
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

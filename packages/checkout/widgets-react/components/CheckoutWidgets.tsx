import { CheckoutWidgetsConfig } from '../definitions/config';
import { CheckoutWidgetTagNames } from '../definitions/constants';
import { Web3Provider } from '@ethersproject/providers';

export function CheckoutWidgets(config: CheckoutWidgetsConfig) {
  var checkoutWidgetJS = document.createElement('script');

  checkoutWidgetJS.setAttribute(
    'src',
    'http://localhost:3000/lib/js/imtbl-checkout.js'
  );

  document.head.appendChild(checkoutWidgetJS);
  window.ImtblCheckoutWidgetConfig = config;
}

export function UpdateConfig(config: CheckoutWidgetsConfig) {
  window.ImtblCheckoutWidgetConfig = config;
}

export function SetProvider(
  tagName: CheckoutWidgetTagNames,
  provider: Web3Provider
) {
  const elements = document.getElementsByTagName(tagName);

  const widget = elements[0] as unknown as ImmutableWebComponent;

  widget.setAttribute('test', 'new value');

  let attempts = 0;
  const maxAttempts = 10;
  let timer;

  const attemptToSetProvider = () => {
    try {
      widget.setProvider(provider);
      window.clearInterval(timer);
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
        console.error('failed to set the provider');
      }
    }
  };

  timer = window.setInterval(attemptToSetProvider, 10);
  attemptToSetProvider();
}

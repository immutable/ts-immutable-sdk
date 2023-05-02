import { CheckoutWidgetsConfig } from '../definitions/config';
import { CheckoutWidgetTagNames } from '../definitions/constants';
import { Web3Provider } from '@ethersproject/providers';

export function CheckoutWidgets(config: CheckoutWidgetsConfig) {
  console.log('CheckoutWidgets.constructor', config);

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
  const el = document.getElementsByTagName(tagName);

  console.log('provider', provider);

  console.log('element', el);

  el[0].setProvider(provider);
}

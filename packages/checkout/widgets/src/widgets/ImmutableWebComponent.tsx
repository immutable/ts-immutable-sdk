import ReactDOM from 'react-dom/client';
import { WidgetTheme } from '@imtbl/checkout-widgets-react';
import { Web3Provider } from '@ethersproject/providers';

export class ImmutableWebComponent extends HTMLElement {
  reactRoot?: ReactDOM.Root;

  theme = WidgetTheme.DARK;
  provider: Web3Provider | undefined = undefined;

  static get observedAttributes() {
    return ['theme'];
  }

  setProvider(provider: Web3Provider): void {
    this.provider = provider;
    this.renderWidget();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue;
  }

  connectedCallback() {
    this.theme = this.getAttribute('theme') as WidgetTheme;
  }

  renderWidget() {
    //must be overloaded by child
    console.error('no render function set in child');
  }
}

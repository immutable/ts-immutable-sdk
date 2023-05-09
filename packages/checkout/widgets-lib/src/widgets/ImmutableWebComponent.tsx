import ReactDOM from 'react-dom/client';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';

export abstract class ImmutableWebComponent extends HTMLElement {
  reactRoot?: ReactDOM.Root;

  environment = Environment.SANDBOX;
  theme = WidgetTheme.DARK;
  provider: Web3Provider | undefined = undefined;

  static get observedAttributes() {
    return ['theme', 'environment'];
  }

  setProvider(provider: Web3Provider): void {
    this.provider = provider;
    this.renderWidget();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue;
    this.renderWidget();
  }

  connectedCallback() {
    this.theme = this.getAttribute('theme') as WidgetTheme;
    this.environment = this.getAttribute('environment') as Environment;
  }

  abstract renderWidget(): void;
}

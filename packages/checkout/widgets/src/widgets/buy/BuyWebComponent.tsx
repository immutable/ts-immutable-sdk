import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk-web';
import ReactDOM from 'react-dom/client';
import { WidgetTheme } from '@imtbl/checkout-ui-types';
import { BuyWidget, BuyWidgetParams } from './BuyWidget';

export class ImmutableBuy extends HTMLElement {
  reactRoot?:ReactDOM.Root

  static get observedAttributes() { return ['theme']; }

  theme = WidgetTheme.LIGHT
  orderId = ''
  providerPreference:ConnectionProviders = ConnectionProviders.METAMASK

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue
    this.renderWidget()
  }

  connectedCallback() {
    this.theme = this.getAttribute('theme') as WidgetTheme;
    this.providerPreference = this.getAttribute('providerPreference') as ConnectionProviders;
    this.orderId = this.getAttribute('orderId') as string;

    this.renderWidget()
  }

  renderWidget() {
    const params:BuyWidgetParams = {
      providerPreference: this.providerPreference,
      orderId: this.orderId,
    }

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }
    
    this.reactRoot.render(
      <React.StrictMode>
        <BuyWidget params={params} theme={this.theme}></BuyWidget>
      </React.StrictMode>
    );
  }
}

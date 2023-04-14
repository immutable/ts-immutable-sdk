import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk-web';
import ReactDOM from 'react-dom/client';
import { WidgetTheme } from '@imtbl/checkout-ui-types';
import { SwapWidget, SwapWidgetParams } from './SwapWidget';

export class ImmutableSwap extends HTMLElement {

  reactRoot?:ReactDOM.Root

  static get observedAttributes() { return ['name']; }

  theme = WidgetTheme.DARK
  providerPreference = ConnectionProviders.METAMASK
  amount = ''
  fromContractAddress = ''
  toContractAddress = ''

  attributeChangedCallback() {
    this.connectedCallback()
  }

  connectedCallback() {

    this.theme = this.getAttribute('theme') as WidgetTheme;
    this.providerPreference = this.getAttribute('providerPreference') as ConnectionProviders;
    this.amount = this.getAttribute('amount') as string;
    this.fromContractAddress = this.getAttribute('fromContractAddress') as string;
    this.toContractAddress = this.getAttribute('toContractAddress') as string;

    const swapParams: SwapWidgetParams = {
      providerPreference: this.providerPreference,
      amount: this.amount,
      fromContractAddress: this.fromContractAddress,
      toContractAddress: this.toContractAddress
    }

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }
    
    this.reactRoot.render(
      <React.StrictMode>
        <SwapWidget
          params={swapParams}
          theme={this.theme}
        />
      </React.StrictMode>
    );
  }
}

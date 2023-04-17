import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk-web';
import ReactDOM from 'react-dom/client';
import {Network, WidgetTheme} from '@imtbl/checkout-ui-types';
import { BridgeWidget, BridgeWidgetParams } from './BridgeWidget';

export class ImmutableBridge extends HTMLElement {

  reactRoot?:ReactDOM.Root

  static get observedAttributes() { return ['theme']; }

  theme = WidgetTheme.DARK
  fromNetwork = Network.ETHEREUM
  fromContract = ''
  amount = ''
  providerPreference:ConnectionProviders = ConnectionProviders.METAMASK

  setTheme(theme:WidgetTheme) {
    this.theme = theme
    this.connectedCallback()
  }

  attributeChangedCallback() {
    this.connectedCallback()
  }

  connectedCallback() {

    this.theme = this.getAttribute('theme') as WidgetTheme;
    this.fromContract = this.getAttribute('fromContractAddress') as string;
    this.fromNetwork = this.getAttribute('fromNetwork') as Network;
    this.amount = this.getAttribute('amount') as string;
    this.providerPreference = this.getAttribute('providerPreference') as ConnectionProviders;

    const params:BridgeWidgetParams = {
      providerPreference: this.providerPreference,
      fromContractAddress: this.fromContract,
      fromNetwork: this.fromNetwork,
      amount: this.amount,
    }

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <BridgeWidget params={params} theme={this.theme}></BridgeWidget>
      </React.StrictMode>
    );
  }
}

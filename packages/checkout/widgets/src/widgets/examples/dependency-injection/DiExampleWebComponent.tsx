import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk-web';
import ReactDOM from 'react-dom/client';
import { WidgetTheme, Network } from '@imtbl/checkout-ui-types';
import { ExampleWidget, ExampleWidgetParams } from './DiExampleWidget';
import { Web3Provider } from '@ethersproject/providers';

export class ImmutableDiExample extends HTMLElement {
  reactRoot?: ReactDOM.Root;

  static get observedAttributes() {
    return ['theme'];
  }

  theme = WidgetTheme.LIGHT;
  fromNetwork = Network.ETHEREUM;
  fromContract = '';
  amount = '';
  providerPreference: ConnectionProviders = ConnectionProviders.METAMASK;
  provider: Web3Provider | undefined = undefined;

  setProvider(provider: Web3Provider) {
    this.provider = provider;
    this.renderWidget();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue;
    this.renderWidget();
  }

  connectedCallback() {
    this.theme = this.getAttribute('theme') as WidgetTheme;
    this.fromContract = this.getAttribute('fromContractAddress') as string;
    this.fromNetwork = this.getAttribute('fromNetwork') as Network;
    this.amount = this.getAttribute('amount') as string;
    this.providerPreference = this.getAttribute(
      'providerPreference'
    ) as ConnectionProviders;
    this.renderWidget();
  }

  renderWidget() {
    const params: ExampleWidgetParams = {
      providerPreference: this.providerPreference,
      fromContractAddress: this.fromContract,
      fromNetwork: this.fromNetwork,
      amount: this.amount,
      provider: this.provider,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <ExampleWidget params={params} theme={this.theme}></ExampleWidget>
      </React.StrictMode>
    );
  }
}

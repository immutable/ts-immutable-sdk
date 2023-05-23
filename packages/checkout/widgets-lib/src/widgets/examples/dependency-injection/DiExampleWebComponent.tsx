import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { Web3Provider } from '@ethersproject/providers';
import { ExampleWidget, ExampleWidgetParams } from './DiExampleWidget';
import { ImmutableWebComponent } from '../../ImmutableWebComponent';

export class ImmutableDiExample extends ImmutableWebComponent {
  static get observedAttributes() {
    return [...ImmutableWebComponent.observedAttributes, 'test'];
  }

  fromNetwork = 'ethereum';

  fromContract = '';

  amount = '';

  providerPreference: ConnectionProviders = ConnectionProviders.METAMASK;

  provider: Web3Provider | undefined = undefined;

  connectedCallback() {
    super.connectedCallback();
    this.fromContract = this.getAttribute('fromContractAddress') as string;
    this.fromNetwork = this.getAttribute('fromNetwork') || 'ethereum';
    this.amount = this.getAttribute('amount') as string;
    this.providerPreference = this.getAttribute(
      'providerPreference',
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
        <ExampleWidget params={params} theme={this.widgetConfig?.theme!} />
      </React.StrictMode>,
    );
  }
}

import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { BridgeWidget, BridgeWidgetParams } from './BridgeWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { Network } from '../../lib';

export class ImmutableBridge extends ImmutableWebComponent {
  fromNetwork = Network.ETHEREUM;

  fromContract = '';

  amount = '';

  providerPreference: ConnectionProviders = ConnectionProviders.METAMASK;

  connectedCallback() {
    super.connectedCallback();
    this.fromContract = this.getAttribute('fromContractAddress') as string;
    this.fromNetwork = this.getAttribute('fromNetwork') as Network;
    this.amount = this.getAttribute('amount') as string;
    this.providerPreference = this.getAttribute(
      'providerPreference',
    ) as ConnectionProviders;
    this.renderWidget();
  }

  renderWidget() {
    const params: BridgeWidgetParams = {
      providerPreference: this.providerPreference,
      fromContractAddress: this.fromContract,
      fromNetwork: this.fromNetwork,
      amount: this.amount,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <BridgeWidget
          params={params}
          widgetConfig={this.widgetConfig!}
        />
      </React.StrictMode>,
    );
  }
}

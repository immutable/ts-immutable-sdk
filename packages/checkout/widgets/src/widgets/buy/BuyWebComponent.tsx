import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { BuyWidget, BuyWidgetParams } from './BuyWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';

export class ImmutableBuy extends ImmutableWebComponent {
  orderId = '';
  providerPreference: ConnectionProviders = ConnectionProviders.METAMASK;

  connectedCallback() {
    super.connectedCallback();
    this.providerPreference = this.getAttribute(
      'providerPreference'
    ) as ConnectionProviders;
    this.orderId = this.getAttribute('orderId') as string;

    this.renderWidget();
  }

  renderWidget() {
    const params: BuyWidgetParams = {
      providerPreference: this.providerPreference,
      orderId: this.orderId,
    };

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

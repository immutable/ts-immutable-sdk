import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { SwapWidget, SwapWidgetParams } from './SwapWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';

export class ImmutableSwap extends ImmutableWebComponent {
  providerPreference = ConnectionProviders.METAMASK;
  amount = '';
  fromContractAddress = '';
  toContractAddress = '';

  connectedCallback() {
    super.connectedCallback();
    this.providerPreference = this.getAttribute(
      'providerPreference'
    ) as ConnectionProviders;
    this.amount = this.getAttribute('amount') as string;
    this.fromContractAddress = this.getAttribute(
      'fromContractAddress'
    ) as string;
    this.toContractAddress = this.getAttribute('toContractAddress') as string;
    this.renderWidget();
  }
  renderWidget() {
    const swapParams: SwapWidgetParams = {
      providerPreference: this.providerPreference,
      amount: this.amount,
      fromContractAddress: this.fromContractAddress,
      toContractAddress: this.toContractAddress,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <SwapWidget params={swapParams} theme={this.theme} />
      </React.StrictMode>
    );
  }
}

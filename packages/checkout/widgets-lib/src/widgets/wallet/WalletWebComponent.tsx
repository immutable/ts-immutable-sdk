import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { WalletWidget, WalletWidgetParams } from './WalletWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';

export class ImmutableWallet extends ImmutableWebComponent {
  providerPreference = ConnectionProviders.METAMASK;

  connectedCallback() {
    super.connectedCallback();
    this.providerPreference = this.getAttribute(
      'providerPreference'
    ) as ConnectionProviders;
    this.renderWidget();
  }

  renderWidget() {
    const walletParams: WalletWidgetParams = {
      providerPreference: this.providerPreference,
      provider: this.provider,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <WalletWidget params={walletParams} theme={this.theme}></WalletWidget>
      </React.StrictMode>
    );
  }
}

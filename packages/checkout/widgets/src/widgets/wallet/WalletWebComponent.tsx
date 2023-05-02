import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { WidgetTheme } from '@imtbl/checkout-widgets-react';
import { WalletWidget, WalletWidgetParams } from './WalletWidget';
import { Web3Provider } from '@ethersproject/providers';

export class ImmutableWallet extends HTMLElement {
  reactRoot?: ReactDOM.Root;

  static get observedAttributes() {
    return ['theme'];
  }

  theme = WidgetTheme.DARK;
  providerPreference = ConnectionProviders.METAMASK;
  provider: Web3Provider | undefined = undefined;

  // setProvider(provider: Web3Provider): void {
  //   this.provider = provider;
  //   this.renderWidget();
  // }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue;
    this.renderWidget();
  }

  connectedCallback() {
    this.theme = this.getAttribute('theme') as WidgetTheme;
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

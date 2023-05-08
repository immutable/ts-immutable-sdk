import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { WalletWidget, WalletWidgetParams } from './WalletWidget';

export class ImmutableWallet extends HTMLElement {
  reactRoot?: ReactDOM.Root;

  static get observedAttributes() {
    return ['theme'];
  }

  theme = WidgetTheme.DARK;
  providerPreference = ConnectionProviders.METAMASK;
  isOnRampEnabled?: boolean;
  isSwapEnabled?: boolean;
  isBridgeEnabled?: boolean;

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue;
    this.renderWidget();
  }

  connectedCallback() {
    this.theme = this.getAttribute('theme') as WidgetTheme;
    this.providerPreference = this.getAttribute(
      'providerPreference'
    ) as ConnectionProviders;
    const isOnRampEnabledProp = this.getAttribute('isOnRampEnabled');
    const isSwapEnabledProp = this.getAttribute('isSwapEnabled');
    const isBridgeEnabledProp = this.getAttribute('isBridgeEnabled');
    this.isOnRampEnabled = isOnRampEnabledProp
      ? isOnRampEnabledProp.toLowerCase() === 'true'
      : undefined;
    this.isSwapEnabled = isSwapEnabledProp
      ? isSwapEnabledProp.toLowerCase() === 'true'
      : undefined;
    this.isBridgeEnabled = isBridgeEnabledProp
      ? isBridgeEnabledProp.toLowerCase() === 'true'
      : undefined;
    this.renderWidget();
  }

  renderWidget() {
    const walletParams: WalletWidgetParams = {
      providerPreference: this.providerPreference,
      topUpFeatures: {
        isBridgeEnabled: this.isBridgeEnabled,
        isSwapEnabled: this.isSwapEnabled,
        isOnRampEnabled: this.isOnRampEnabled,
      },
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

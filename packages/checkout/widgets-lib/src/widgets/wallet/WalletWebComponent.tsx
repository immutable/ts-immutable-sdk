import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { WalletWidget, WalletWidgetParams } from './WalletWidget';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';

export class ImmutableWallet extends HTMLElement {
  reactRoot?: ReactDOM.Root;

  static get observedAttributes() {
    return ['theme'];
  }

  theme = WidgetTheme.DARK;
  providerPreference = ConnectionProviders.METAMASK;
  useConnectWidget?: boolean;
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
    const useConnectWidgetProp = this.getAttribute('useConnectWidget');
    const isOnRampEnabledProp = this.getAttribute('isOnRampEnabled');
    const isSwapEnabledProp = this.getAttribute('isSwapEnabled');
    const isBridgeEnabledProp = this.getAttribute('isBridgeEnabled');
    this.useConnectWidget = useConnectWidgetProp
      ? useConnectWidgetProp.toLowerCase() === 'true'
      : undefined;
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
    const connectLoaderParams: ConnectLoaderParams = {
      providerPreference: this.providerPreference,
    };

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
        {this.useConnectWidget ? (
          <ConnectLoader
            theme={this.theme}
            params={connectLoaderParams}
            closeEvent={sendWalletWidgetCloseEvent}
          >
            <WalletWidget
              params={walletParams}
              theme={this.theme}
            ></WalletWidget>
          </ConnectLoader>
        ) : (
          <WalletWidget params={walletParams} theme={this.theme}></WalletWidget>
        )}
      </React.StrictMode>
    );
  }
}

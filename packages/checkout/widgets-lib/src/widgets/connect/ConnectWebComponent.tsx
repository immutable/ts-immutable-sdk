import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { ConnectWidget, ConnectWidgetParams } from './ConnectWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';

export class ImmutableConnect extends ImmutableWebComponent {
  walletProvider = WalletProviderName.METAMASK;

  connectedCallback() {
    super.connectedCallback();
    this.walletProvider = this.getAttribute(
      'walletProvider',
    ) as WalletProviderName;
    this.renderWidget();
  }

  renderWidget() {
    const connectParams: ConnectWidgetParams = {
      providerName: this.walletProvider,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <ConnectWidget
          params={connectParams}
          config={this.widgetConfig!}
        />
      </React.StrictMode>,
    );
  }
}

import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { ConnectWidget, ConnectWidgetParams } from './ConnectWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';

export class ImmutableConnect extends ImmutableWebComponent {
  providerName = WalletProviderName.METAMASK;

  connectedCallback() {
    super.connectedCallback();
    this.providerName = this.getAttribute(
      'providerName',
    ) as WalletProviderName;
    this.renderWidget();
  }

  renderWidget() {
    const connectParams: ConnectWidgetParams = {
      providerName: this.providerName,
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

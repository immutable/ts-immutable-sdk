import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import ReactDOM from 'react-dom/client';
import { ConnectWidget, ConnectWidgetParams } from './ConnectWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';

export class ImmutableConnect extends ImmutableWebComponent {
  providerPreference = ConnectionProviders.METAMASK;

  connectedCallback() {
    super.connectedCallback();
    this.providerPreference = this.getAttribute(
      'providerPreference'
    ) as ConnectionProviders;
    this.renderWidget();
  }

  renderWidget() {
    const connectParams: ConnectWidgetParams = {
      providerPreference: this.providerPreference,
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <ConnectWidget
          params={connectParams}
          theme={this.theme}
        ></ConnectWidget>
      </React.StrictMode>
    );
  }
}

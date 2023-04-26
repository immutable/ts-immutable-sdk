import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk-web';
import ReactDOM from 'react-dom/client';
import { WidgetTheme } from '@imtbl/checkout-ui-types';
import { ConnectWidget, ConnectWidgetParams } from './ConnectWidget';

export class ImmutableConnect extends HTMLElement {
  reactRoot?: ReactDOM.Root;

  static get observedAttributes() {
    return ['theme'];
  }

  theme = WidgetTheme.LIGHT;
  providerPreference = ConnectionProviders.METAMASK;

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

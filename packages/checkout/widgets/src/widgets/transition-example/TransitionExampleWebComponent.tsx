import React from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk-web';
import ReactDOM from 'react-dom/client';
import { WidgetTheme } from '@imtbl/checkout-ui-types';
import { TransitionExampleWidget, TransitionExampleWidgetParams } from './TransitionExampleWidget';

export class ImmutableTransitionExample extends HTMLElement {
  reactRoot?:ReactDOM.Root

  static get observedAttributes() { return ['theme']; }

  theme = WidgetTheme.LIGHT
  providerPreference:ConnectionProviders = ConnectionProviders.METAMASK

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue
    this.renderWidget()
  }

  connectedCallback() {
    this.theme = this.getAttribute('theme') as WidgetTheme;
    this.providerPreference = this.getAttribute('providerPreference') as ConnectionProviders;
    this.renderWidget()
  }

  renderWidget() {
    const params: TransitionExampleWidgetParams = {
      providerPreference: this.providerPreference,
    }

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }
    
    this.reactRoot.render(
      <React.StrictMode>
        <TransitionExampleWidget params={params} theme={this.theme}></TransitionExampleWidget>
      </React.StrictMode>
    );
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConnectionProviders, WidgetTheme } from '@imtbl/checkout-ui-types';
import { OuterWidget, OuterWidgetParams } from './OuterWidget';
import { InnerWidget } from '../inner-widget/InnerWidget';
import { ConnectionLoader } from '../connection-loader/connection-loader';

export class ImmutableOuterExample extends HTMLElement {
  reactRoot?: ReactDOM.Root;

  static get observedAttributes() {
    return ['theme'];
  }

  theme = WidgetTheme.LIGHT;

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue;
    this.renderWidget();
  }

  connectedCallback() {
    this.theme = this.getAttribute('theme') as WidgetTheme;
    this.renderWidget();
  }

  renderWidget() {
    const params: OuterWidgetParams = {};

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <ConnectionLoader params={params} theme={this.theme}>
          <OuterWidget params={params} theme={this.theme}></OuterWidget>
        </ConnectionLoader>
      </React.StrictMode>
    );
  }
}

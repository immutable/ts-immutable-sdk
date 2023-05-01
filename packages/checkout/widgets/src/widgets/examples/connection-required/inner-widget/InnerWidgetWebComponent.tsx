import React from 'react';
import ReactDOM from 'react-dom/client';
import { WidgetTheme } from '@imtbl/checkout-ui-types';
import { InnerWidget, InnerWidgetParams } from './InnerWidget';

export class ImmutableInnerExample extends HTMLElement {
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
    const params: InnerWidgetParams = {};

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <InnerWidget params={params} theme={this.theme}></InnerWidget>
      </React.StrictMode>
    );
  }
}

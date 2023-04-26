import React from 'react';
import ReactDOM from 'react-dom/client';
import { WidgetTheme } from '@imtbl/checkout-ui-types';
import { TransitionExampleWidget, TransitionExampleWidgetParams } from './TransitionExampleWidget';

export class ImmutableTransitionExample extends HTMLElement {
  reactRoot?:ReactDOM.Root

  static get observedAttributes() { return ['theme']; }

  theme = WidgetTheme.LIGHT

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue
    this.renderWidget()
  }

  connectedCallback() {
    this.theme = this.getAttribute('theme') as WidgetTheme;
    this.renderWidget()
  }

  renderWidget() {
    const params: TransitionExampleWidgetParams = {}

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

import React from 'react';
import ReactDOM from 'react-dom/client';
import { OuterWidget, OuterWidgetParams } from './OuterWidget';
import { ConnectionLoader } from '../connection-loader/ConnectionLoader';
import { ImmutableWebComponent } from '../../../ImmutableWebComponent';

export class ImmutableOuterExample extends ImmutableWebComponent {
  connectedCallback() {
    super.connectedCallback();
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

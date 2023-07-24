import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConnectWidget } from './ConnectWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';

export class ImmutableConnect extends ImmutableWebComponent {
  connectedCallback() {
    super.connectedCallback();
    this.renderWidget();
  }

  renderWidget() {
    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <ConnectWidget
          config={this.widgetConfig!}
        />
      </React.StrictMode>,
    );
  }
}

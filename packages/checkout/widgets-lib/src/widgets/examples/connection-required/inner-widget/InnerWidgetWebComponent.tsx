import React from 'react';
import ReactDOM from 'react-dom/client';
import { InnerWidget, InnerWidgetParams } from './InnerWidget';
import { ImmutableWebComponent } from '../../../ImmutableWebComponent';

export class ImmutableInnerExample extends ImmutableWebComponent {
  connectedCallback() {
    super.connectedCallback();
    this.renderWidget();
  }

  renderWidget() {
    const params: InnerWidgetParams = {};

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <InnerWidget params={params} theme={this.widgetConfig?.theme!} />
      </React.StrictMode>,
    );
  }
}

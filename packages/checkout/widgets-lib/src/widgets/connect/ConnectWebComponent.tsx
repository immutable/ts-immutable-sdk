import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConnectWidget } from './ConnectWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { AnalyticsProvider } from '../../context/segment-provider/SegmentAnalyticsProvider';

export class ImmutableConnect extends ImmutableWebComponent {
  connectedCallback() {
    super.connectedCallback();
    this.renderWidget();
  }

  validateInputs(): void {
    // not implemented as nothing to validate for ConnectWidget
  }

  renderWidget() {
    this.validateInputs();

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <AnalyticsProvider>
          <ConnectWidget
            config={this.widgetConfig!}
            params={{
              passport: this.passport,
            }}
          />
        </AnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

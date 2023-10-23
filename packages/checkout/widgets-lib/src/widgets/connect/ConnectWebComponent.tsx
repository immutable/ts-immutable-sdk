import React from 'react';
import ReactDOM from 'react-dom/client';
import { BiomePortalIdProvider } from '@biom3/react';
import { ConnectWidget } from './ConnectWidget';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';

export class ImmutableConnect extends ImmutableWebComponent {
  connectedCallback() {
    super.connectedCallback();
    this.renderWidget();
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any): void {
    super.attributeChangedCallback(name, oldValue, newValue);

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
        <BiomePortalIdProvider>
          <CustomAnalyticsProvider
            widgetConfig={this.widgetConfig!}
          >
            <ConnectWidget
              config={this.widgetConfig!}
              params={{
                passport: this.passport,
              }}
            />
          </CustomAnalyticsProvider>
        </BiomePortalIdProvider>
      </React.StrictMode>,
    );
  }
}

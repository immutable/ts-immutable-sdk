import React from 'react';
import { WidgetType } from '@imtbl/checkout-sdk';
import { ConnectWidget } from './connect/ConnectWidget';
import { CustomAnalyticsProvider } from '../context/analytics-provider/CustomAnalyticsProvider';
import { Base } from './Base';

export class Connect<T extends WidgetType> extends Base<T> {
  protected eventTarget: string = 'imtbl-connect-widget';

  protected rerender() {
    if (this.reactRoot) {
      this.reactRoot.render(
        <React.StrictMode>
          <CustomAnalyticsProvider
            widgetConfig={this.strongConfig()}
          >
            <ConnectWidget
              config={this.strongConfig()}
              {...this.properties.params}
            />
          </CustomAnalyticsProvider>
        </React.StrictMode>,
      );
    }
  }
}

import React from 'react';
import { WidgetType } from '@imtbl/checkout-sdk';
import { ConnectWidget } from './ConnectWidget';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { Base } from '../BaseWidgetRoot';

export class Connect<T extends WidgetType> extends Base<T> {
  protected eventTopic: string = 'imtbl-connect-widget';

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

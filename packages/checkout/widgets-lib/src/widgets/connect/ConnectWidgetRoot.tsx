import React from 'react';
import { IMTBLWidgetEvents, WidgetType } from '@imtbl/checkout-sdk';
import { ConnectWidget } from './ConnectWidget';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { Base } from '../BaseWidgetRoot';

export class Connect extends Base<WidgetType.CONNECT> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT;

  protected render() {
    if (!this.reactRoot) return;

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

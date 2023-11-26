import React from 'react';
import {
  ConnectWidgetParams, IMTBLWidgetEvents, WidgetProperties, WidgetType,
} from '@imtbl/checkout-sdk';
import { ConnectWidget } from './ConnectWidget';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { Base } from '../BaseWidgetRoot';

export class Connect extends Base<WidgetType.CONNECT> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT;

  protected getValidatedProperties(
    { config, provider }: WidgetProperties<WidgetType.CONNECT>,
  ): WidgetProperties<WidgetType.CONNECT> {
    return {
      config,
      provider,
    };
  }

  protected getValidatedParameters(params: ConnectWidgetParams): ConnectWidgetParams {
    return params;
  }

  protected render() {
    if (!this.reactRoot) return;
    console.log('SDK::ConnectWidgetRoot::render::this.web3Provider:', this.web3Provider);
    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider
          widgetConfig={this.strongConfig()}
        >
          <ConnectWidget
            config={this.strongConfig()}
            checkout={this.checkout}
            web3Provider={this.web3Provider}
          />
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

import React, { Suspense } from 'react';
import {
  ConnectWidgetParams, IMTBLWidgetEvents, WidgetProperties, WidgetType,
} from '@imtbl/checkout-sdk';
import { ThemeProvider } from 'components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { Base } from '../BaseWidgetRoot';

const ConnectWidget = React.lazy(() => import('./ConnectWidget'));

export class Connect extends Base<WidgetType.CONNECT> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT;

  protected getValidatedProperties(
    { config }: WidgetProperties<WidgetType.CONNECT>,
  ): WidgetProperties<WidgetType.CONNECT> {
    return {
      config,
    };
  }

  protected getValidatedParameters(params: ConnectWidgetParams): ConnectWidgetParams {
    return params;
  }

  protected render() {
    if (!this.reactRoot) return;

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="connect-container" config={this.strongConfig()}>
            <Suspense fallback={<div />}>
              <ConnectWidget
                config={this.strongConfig()}
                checkout={this.checkout}
              />
            </Suspense>
          </ThemeProvider>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

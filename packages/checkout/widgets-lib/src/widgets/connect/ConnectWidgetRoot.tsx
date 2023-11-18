import React from 'react';
import {
  ConnectWidgetParams, IMTBLWidgetEvents, WidgetProperties, WidgetType,
} from '@imtbl/checkout-sdk';
import { BaseTokens } from '@biom3/design-tokens';
import { widgetTheme } from 'lib/theme';
import { BiomeCombinedProviders } from '@biom3/react';
import { ConnectWidget } from './ConnectWidget';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { Base } from '../BaseWidgetRoot';

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

    const themeBase: BaseTokens = widgetTheme(this.strongConfig().theme);

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider widgetConfig={this.strongConfig()}>
          <BiomeCombinedProviders theme={{ base: themeBase }}>
            <ConnectWidget
              config={this.strongConfig()}
              checkout={this.checkout}
            />
          </BiomeCombinedProviders>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

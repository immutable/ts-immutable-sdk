import {
  IMTBLWidgetEvents,
  CheckoutWidgetConfiguration,
  CheckoutWidgetParams,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import React, { Suspense } from 'react';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import i18n from '../../i18n';
import { LoadingView } from '../../views/loading/LoadingView';
import { Base } from '../BaseWidgetRoot';

const CheckoutWidget = React.lazy(() => import('./CheckoutWidget'));

export class CheckoutWidgetRoot extends Base<WidgetType.CHECKOUT> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT;

  protected getValidatedProperties(
    { config }: WidgetProperties<WidgetType.CHECKOUT>,
  ): WidgetProperties<WidgetType.CHECKOUT> {
    let validatedConfig: CheckoutWidgetConfiguration | undefined;

    if (config) {
      validatedConfig = config;
      if (config.theme === WidgetTheme.LIGHT) validatedConfig.theme = WidgetTheme.LIGHT;
      else validatedConfig.theme = WidgetTheme.DARK;
    }
    return {
      config: validatedConfig,
    };
  }

  protected getValidatedParameters(params: CheckoutWidgetParams): CheckoutWidgetParams {
    return params;
  }

  protected render() {
    if (!this.reactRoot) return;
    const { t } = i18n;
    const config = this.strongConfig();

    this.reactRoot.render(
      <CustomAnalyticsProvider checkout={this.checkout}>
        <ThemeProvider id="checkout-container" config={this.strongConfig()}>
          <HandoverProvider>
            <Suspense
              fallback={
                <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
                  }
            >
              {/* TODO: pass on params */}
              <CheckoutWidget
                checkout={this.checkout}
                config={config}
                params={this.parameters}
              />
            </Suspense>
          </HandoverProvider>
        </ThemeProvider>
      </CustomAnalyticsProvider>,
    );
  }
}

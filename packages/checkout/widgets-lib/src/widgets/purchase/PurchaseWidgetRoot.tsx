import {
  IMTBLWidgetEvents,
  PurchaseWidgetParams,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import React, { Suspense } from 'react';
import { Base } from '../BaseWidgetRoot';
import i18n from '../../i18n';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import { ProvidersContextProvider } from '../../context/providers-context/ProvidersContext';
import { LoadingView } from '../../views/loading/LoadingView';
import PurchaseWidget from './PurchaseWidget';

export class Purchase extends Base<WidgetType.PURCHASE> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_PURCHASE_WIDGET_EVENT;

  protected getValidatedProperties({
    config,
  }: WidgetProperties<WidgetType.PURCHASE>): WidgetProperties<WidgetType.PURCHASE> {
    let validatedConfig: WidgetConfiguration | undefined;

    if (config) {
      validatedConfig = config;
      if (config.theme === WidgetTheme.LIGHT) {
        validatedConfig.theme = WidgetTheme.LIGHT;
      } else {
        validatedConfig.theme = WidgetTheme.DARK;
      }
    }

    return {
      config: validatedConfig,
    };
  }

  protected getValidatedParameters(
    params: PurchaseWidgetParams,
  ): PurchaseWidgetParams {
    const validatedParams = params;

    if (!params.environmentId) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "environmentId" widget input');
      validatedParams.environmentId = '';
    }

    return validatedParams;
  }

  protected render() {
    if (!this.reactRoot) return;

    const { t } = i18n;

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="purchase-container" config={this.strongConfig()}>
            <HandoverProvider>
              <ProvidersContextProvider
                initialState={{
                  checkout: this.checkout,
                }}
              >
                <Suspense
                  fallback={
                    <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
                }
                >
                  <PurchaseWidget
                    config={this.strongConfig()}
                    environmentId={this.parameters.environmentId}
                  />
                </Suspense>
              </ProvidersContextProvider>
            </HandoverProvider>
          </ThemeProvider>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

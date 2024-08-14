import {
  IMTBLWidgetEvents,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import React, { Suspense } from 'react';
import { AddFundsWidgetParams } from '@imtbl/checkout-sdk/dist/widgets/definitions/parameters/addFunds';
import { Base } from '../BaseWidgetRoot';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import i18n from '../../i18n';
import { LoadingView } from '../../views/loading/LoadingView';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';

const AddFundsWidget = React.lazy(() => import('./AddFundsWidget'));

export class AddFunds extends Base<WidgetType.ADD_FUNDS> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT;

  protected getValidatedProperties({
    config,
  }: WidgetProperties<WidgetType.ADD_FUNDS>): WidgetProperties<WidgetType.ADD_FUNDS> {
    let validatedConfig: WidgetConfiguration | undefined;

    if (config) {
      validatedConfig = config;
      if (config.theme === WidgetTheme.LIGHT) validatedConfig.theme = WidgetTheme.LIGHT;
      else validatedConfig.theme = WidgetTheme.DARK;
    }

    return {
      config: validatedConfig,
    };
  }

  protected getValidatedParameters(
    params: AddFundsWidgetParams,
  ): AddFundsWidgetParams {
    const validatedParams = params;
    // TODO : ADD params
    return validatedParams;
  }

  protected render() {
    if (!this.reactRoot) return;
    const { t } = i18n;

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="add-funds-container" config={this.strongConfig()}>
            <HandoverProvider>
              <Suspense
                fallback={
                  <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
                }
              >
                <AddFundsWidget
                  checkout={this.checkout}
                  config={this.strongConfig()}
                  web3Provider={this.web3Provider}
                />
              </Suspense>
            </HandoverProvider>
          </ThemeProvider>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

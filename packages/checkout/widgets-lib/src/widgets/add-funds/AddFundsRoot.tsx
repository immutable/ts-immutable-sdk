import {
  IMTBLWidgetEvents,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
  AddFundsWidgetParams,
} from '@imtbl/checkout-sdk';
import React, { Suspense } from 'react';
import { Base } from '../BaseWidgetRoot';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import i18n from '../../i18n';
import { LoadingView } from '../../views/loading/LoadingView';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import {
  isValidAddress,
  isValidAmount,
} from '../../lib/validations/widgetValidators';
import { ProvidersContextProvider } from '../../context/providers-context/ProvidersContext';

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

    if (!isValidAmount(params.toAmount)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "toAmount" widget input');
      validatedParams.toAmount = '';
    }

    if (!isValidAddress(params.toTokenAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "toTokenAddress" widget input');
      validatedParams.toTokenAddress = '';
    }

    return validatedParams;
  }

  protected render() {
    if (!this.reactRoot) return;

    const { t } = i18n;

    this.reactRoot.render(
      // <React.StrictMode>
      <CustomAnalyticsProvider checkout={this.checkout}>
        <ThemeProvider id="add-funds-container" config={this.strongConfig()}>
          <HandoverProvider>
            <ProvidersContextProvider
              initialState={{
                checkout: this.checkout,
                fromProvider: this.web3Provider,
              }}
            >
              <Suspense
                fallback={
                  <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
                }
              >
                <AddFundsWidget
                  config={this.strongConfig()}
                  toTokenAddress={this.parameters.toTokenAddress}
                  toAmount={this.parameters.toAmount}
                  showBridgeOption={this.parameters.showBridgeOption}
                  showSwapOption={this.parameters.showSwapOption}
                  showOnrampOption={this.parameters.showOnrampOption}
                  showBackButton={this.parameters.showBackButton}
                />
              </Suspense>
            </ProvidersContextProvider>
          </HandoverProvider>
        </ThemeProvider>
      </CustomAnalyticsProvider>,
      // </React.StrictMode>,
    );
  }
}

import React, { Suspense } from 'react';
import {
  BridgeWidgetParams,
  IMTBLWidgetEvents,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from '../BaseWidgetRoot';
import { isValidWalletProvider, isValidAmount, isValidAddress } from '../../lib/validations/widgetValidators';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { LoadingView } from '../../views/loading/LoadingView';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import i18n from '../../i18n';

const BridgeWidget = React.lazy(() => import('./BridgeWidget'));

export class Bridge extends Base<WidgetType.BRIDGE> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT;

  protected getValidatedProperties(
    { config }: WidgetProperties<WidgetType.BRIDGE>,
  ): WidgetProperties<WidgetType.BRIDGE> {
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

  protected getValidatedParameters(params: BridgeWidgetParams): BridgeWidgetParams {
    const validatedParams = params;
    if (!isValidWalletProvider(params.walletProviderName)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "walletProviderName" widget input');
      validatedParams.walletProviderName = undefined;
    }

    if (!isValidAmount(params.amount)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "amount" widget input');
      validatedParams.amount = '';
    }

    if (!isValidAddress(params.tokenAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "tokenAddress" widget input');
      validatedParams.tokenAddress = '';
    }

    return validatedParams;
  }

  protected render() {
    if (!this.reactRoot) return;
    const { t } = i18n;

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="bridge-container" config={this.strongConfig()}>
            <HandoverProvider>
              <Suspense fallback={<LoadingView loadingText={t('views.LOADING_VIEW.text')} />}>
                <BridgeWidget
                  checkout={this.checkout}
                  config={this.strongConfig()}
                  browserProvider={this.browserProvider}
                  tokenAddress={this.parameters.tokenAddress}
                  amount={this.parameters.amount}
                  walletProviderName={this.parameters.walletProviderName}
                  showBackButton={!!this.parameters.showBackButton}
                />
              </Suspense>
            </HandoverProvider>
          </ThemeProvider>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

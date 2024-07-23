import {
  ChainId,
  IMTBLWidgetEvents,
  CheckoutWidgetConfiguration,
  CheckoutWidgetParams,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import React, { Suspense } from 'react';
import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import i18n from '../../i18n';
import { getL1ChainId, getL2ChainId } from '../../lib';
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
    const validatedParams = params;

    return validatedParams;
  }

  protected render() {
    if (!this.reactRoot) return;

    const { t } = i18n;
    const connectLoaderParams: ConnectLoaderParams = {
      targetChainId: this.checkout.config.isProduction
        ? ChainId.IMTBL_ZKEVM_MAINNET
        : ChainId.IMTBL_ZKEVM_TESTNET,
      // walletProviderName: this.parameters?.walletProviderName,
      web3Provider: this.web3Provider,
      checkout: this.checkout,
      allowedChains: [getL1ChainId(this.checkout.config), getL2ChainId(this.checkout.config)],
    };

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="checkout-container" config={this.strongConfig()}>
            <HandoverProvider>
              <ConnectLoader
                widgetConfig={this.strongConfig()}
                params={connectLoaderParams}
                closeEvent={() => { }}
              >
                <Suspense
                  fallback={
                    <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
                  }
                >
                  <CheckoutWidget
                    config={this.strongConfig()}
                  />
                </Suspense>
              </ConnectLoader>
            </HandoverProvider>
          </ThemeProvider>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

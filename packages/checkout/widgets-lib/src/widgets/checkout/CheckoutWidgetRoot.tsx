import {
  IMTBLWidgetEvents,
  CheckoutWidgetConfiguration,
  CheckoutWidgetParams,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
  ChainId,
} from '@imtbl/checkout-sdk';
import React, { Suspense } from 'react';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import { LoadingView } from '../../views/loading/LoadingView';
import { Base } from '../BaseWidgetRoot';
import i18n from '../../i18n';
import { getL2ChainId } from '../../lib';
import { ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';

const CheckoutWidget = React.lazy(() => import('./CheckoutWidget'));

export class CheckoutWidgetRoot extends Base<WidgetType.CHECKOUT> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT;

  protected getValidatedProperties({
    config,
  }: WidgetProperties<WidgetType.CHECKOUT>): WidgetProperties<WidgetType.CHECKOUT> {
    let validatedConfig: CheckoutWidgetConfiguration | undefined;

    if (config) {
      validatedConfig = config;
      // FIXME: Move default theme initialisation to Base class
      if (config.theme === WidgetTheme.LIGHT) validatedConfig.theme = WidgetTheme.LIGHT;
      else validatedConfig.theme = WidgetTheme.DARK;
    }

    // TODO: validate configs for each widget
    return {
      config: validatedConfig,
    };
  }

  protected getValidatedParameters(
    params: CheckoutWidgetParams,
  ): CheckoutWidgetParams {
    // TODO: Validate params for each widget
    return params;
  }

  protected render() {
    if (!this.reactRoot) return;

    const { t } = i18n;

    const connectLoaderParams: ConnectLoaderParams = {
      targetChainId: this.checkout.config.isProduction
        ? ChainId.IMTBL_ZKEVM_MAINNET
        : ChainId.IMTBL_ZKEVM_TESTNET,
      web3Provider: this.web3Provider,
      checkout: this.checkout,
      allowedChains: [getL2ChainId(this.checkout!.config)],
    };

    this.reactRoot.render(
      <CustomAnalyticsProvider checkout={this.checkout}>
        <ThemeProvider id="checkout-container" config={this.strongConfig()}>
          <HandoverProvider>
            <Suspense
              fallback={
                <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
              }
            >
              <CheckoutWidget
                checkout={this.checkout}
                web3Provider={this.web3Provider}
                flowParams={this.parameters}
                flowConfig={this.properties.config || {}}
                widgetsConfig={this.strongConfig()}
                connectLoaderParams={connectLoaderParams}
              />
            </Suspense>
          </HandoverProvider>
        </ThemeProvider>
      </CustomAnalyticsProvider>,
    );
  }
}

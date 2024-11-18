import React, { Suspense } from 'react';
import {
  ChainId,
  IMTBLWidgetEvents,
  SwapDirection,
  SwapWidgetParams,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from '../BaseWidgetRoot';
import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { getL2ChainId } from '../../lib';
import { isValidAddress, isValidAmount, isValidWalletProvider } from '../../lib/validations/widgetValidators';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { LoadingView } from '../../views/loading/LoadingView';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import { sendSwapWidgetCloseEvent } from './SwapWidgetEvents';
import i18n from '../../i18n';

const SwapWidget = React.lazy(() => import('./SwapWidget'));

export class Swap extends Base<WidgetType.SWAP> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT;

  protected getValidatedProperties(
    { config }: WidgetProperties<WidgetType.SWAP>,
  ): WidgetProperties<WidgetType.SWAP> {
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

  protected getValidatedParameters(params: SwapWidgetParams): SwapWidgetParams {
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

    if (!isValidAddress(params.fromTokenAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "fromTokenAddress" widget input');
      validatedParams.fromTokenAddress = '';
    }

    if (!isValidAddress(params.toTokenAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "toTokenAddress" widget input');
      validatedParams.toTokenAddress = '';
    }

    if (params.autoProceed) {
      validatedParams.autoProceed = true;
    }

    return validatedParams;
  }

  protected render() {
    if (!this.reactRoot) return;

    const { t } = i18n;
    const connectLoaderParams: ConnectLoaderParams = {
      targetChainId: this.checkout.config.isProduction
        ? ChainId.IMTBL_ZKEVM_MAINNET
        : ChainId.IMTBL_ZKEVM_TESTNET,
      browserProvider: this.browserProvider,
      checkout: this.checkout,
      allowedChains: [getL2ChainId(this.checkout!.config)],
    };

    this.reactRoot!.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="swap-container" config={this.strongConfig()}>
            <HandoverProvider>
              <ConnectLoader
                params={connectLoaderParams}
                widgetConfig={this.strongConfig()}
                closeEvent={() => sendSwapWidgetCloseEvent(window)}
              >
                <Suspense fallback={<LoadingView loadingText={t('views.LOADING_VIEW.text')} />}>
                  <SwapWidget
                    fromTokenAddress={this.parameters.fromTokenAddress}
                    toTokenAddress={this.parameters.toTokenAddress}
                    amount={this.parameters.amount}
                    config={this.strongConfig()}
                    autoProceed={this.parameters.autoProceed}
                    direction={this.parameters.direction ?? SwapDirection.FROM}
                    showBackButton={this.parameters.showBackButton}
                    walletProviderName={this.parameters.walletProviderName}
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

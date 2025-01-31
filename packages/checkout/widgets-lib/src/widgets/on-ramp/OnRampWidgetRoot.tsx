import React, { Suspense } from 'react';
import {
  ChainId,
  IMTBLWidgetEvents,
  OnRampWidgetParams,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from '../BaseWidgetRoot';
import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { getL1ChainId, getL2ChainId } from '../../lib';
import { isValidAddress, isValidAmount } from '../../lib/validations/widgetValidators';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { LoadingView } from '../../views/loading/LoadingView';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import { sendOnRampWidgetCloseEvent } from './OnRampWidgetEvents';
import i18n from '../../i18n';
import { orchestrationEvents } from '../../lib/orchestrationEvents';

const OnRampWidget = React.lazy(() => import('./OnRampWidget'));

export class OnRamp extends Base<WidgetType.ONRAMP> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT;

  protected getValidatedProperties(
    { config }: WidgetProperties<WidgetType.ONRAMP>,
  ): WidgetProperties<WidgetType.ONRAMP> {
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

  protected getValidatedParameters(params: OnRampWidgetParams): OnRampWidgetParams {
    const validatedParams = { ...params };

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

    if (params.showBackButton) {
      validatedParams.showBackButton = true;
    }

    return validatedParams;
  }

  private goBackEvent = (eventTarget: Window | EventTarget) => {
    orchestrationEvents.sendRequestGoBackEvent(
      eventTarget,
      IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
      {},
    );
  };

  protected render() {
    if (!this.reactRoot) return;

    const { t } = i18n;
    const connectLoaderParams: ConnectLoaderParams = {
      targetChainId: this.checkout.config.isProduction
        ? ChainId.IMTBL_ZKEVM_MAINNET
        : ChainId.IMTBL_ZKEVM_TESTNET,
      walletProviderName: this.parameters.walletProviderName,
      browserProvider: this.browserProvider,
      checkout: this.checkout,
      allowedChains: [getL1ChainId(this.checkout.config), getL2ChainId(this.checkout.config)],
    };

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="onramp-container" config={this.strongConfig()}>
            <HandoverProvider>
              <ConnectLoader
                widgetConfig={this.strongConfig()}
                params={connectLoaderParams}
                closeEvent={() => sendOnRampWidgetCloseEvent(window)}
                goBackEvent={() => this.goBackEvent(window)}
                showBackButton={this.parameters.showBackButton}
              >
                <Suspense fallback={<LoadingView loadingText={t('views.ONRAMP.initialLoadingText')} />}>
                  <OnRampWidget
                    tokenAddress={this.parameters.tokenAddress}
                    amount={this.parameters.amount}
                    config={this.strongConfig()}
                    showBackButton={this.parameters.showBackButton}
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

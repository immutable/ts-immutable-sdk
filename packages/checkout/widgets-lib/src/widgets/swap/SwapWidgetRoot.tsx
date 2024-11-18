import React, { Suspense } from 'react';
import {
  ChainId,
  IMTBLWidgetEvents,
  SwapDirection,
  SwapWidgetParams,
  WalletProviderName,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from '../BaseWidgetRoot';
import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { getL2ChainId } from '../../lib';
import { isPassportProvider } from '../../lib/provider';
import { ServiceUnavailableToRegionErrorView } from '../../views/error/ServiceUnavailableToRegionErrorView';
import { ServiceType } from '../../views/error/serviceTypes';
import { isValidAddress, isValidAmount, isValidWalletProvider } from '../../lib/validations/widgetValidators';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { LoadingView } from '../../views/loading/LoadingView';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import { topUpBridgeOption, topUpOnRampOption } from './helpers';
import { sendSwapWidgetCloseEvent } from './SwapWidgetEvents';
import i18n from '../../i18n';
import { GeoblockLoader } from './GeoblockLoader';

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

  private isNotPassport = !isPassportProvider(this.browserProvider?.name)
    || this.parameters?.walletProviderName !== WalletProviderName.PASSPORT;

  private topUpOptions(): { textKey: string; action: () => void }[] | undefined {
    const optionsArray: { textKey: string; action: () => void }[] = [];

    const isOnramp = topUpOnRampOption(this.strongConfig().isOnRampEnabled);
    if (isOnramp) {
      optionsArray.push({ ...isOnramp });
    }
    const isBridge = topUpBridgeOption(
      this.strongConfig().isBridgeEnabled,
      this.isNotPassport,
    );
    if (isBridge) {
      optionsArray.push({ ...isBridge });
    }

    return optionsArray;
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

    const topUpOptions = this.topUpOptions();

    this.reactRoot!.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="swap-container" config={this.strongConfig()}>
            <HandoverProvider>
              <GeoblockLoader
                checkout={this.checkout}
                widget={
                (
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
                      />
                    </Suspense>
                  </ConnectLoader>
                )
              }
                serviceUnavailableView={
                (
                  <ServiceUnavailableToRegionErrorView
                    service={ServiceType.SWAP}
                    onCloseClick={() => sendSwapWidgetCloseEvent(window)}
                    primaryActionText={
                      topUpOptions && topUpOptions?.length > 0
                        ? t(topUpOptions[0].textKey)
                        : undefined
                    }
                    onPrimaryButtonClick={
                      topUpOptions && topUpOptions?.length > 0
                        ? topUpOptions[0].action
                        : undefined
                    }
                    secondaryActionText={
                      topUpOptions?.length === 2
                        ? t(topUpOptions[1].textKey)
                        : undefined
                    }
                    onSecondaryButtonClick={
                      topUpOptions?.length === 2
                        ? topUpOptions[1].action
                        : undefined
                    }
                  />
                )
              }
              />
            </HandoverProvider>
          </ThemeProvider>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

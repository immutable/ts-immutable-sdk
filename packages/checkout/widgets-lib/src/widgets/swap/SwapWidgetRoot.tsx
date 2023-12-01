import React, { Suspense } from 'react';
import {
  ConnectTargetLayer,
  IMTBLWidgetEvents,
  SwapWidgetParams,
  WalletProviderName,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from 'widgets/BaseWidgetRoot';
import { ConnectLoader, ConnectLoaderParams } from 'components/ConnectLoader/ConnectLoader';
import { getL2ChainId } from 'lib';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { BiomeCombinedProviders, BiomePortalIdProvider } from '@biom3/react';
import { isPassportProvider } from 'lib/providerUtils';
import { ServiceUnavailableErrorView } from 'views/error/ServiceUnavailableErrorView';
import { ServiceType } from 'views/error/serviceTypes';
import { isValidAddress, isValidAmount, isValidWalletProvider } from 'lib/validations/widgetValidators';
import { widgetTheme } from 'lib/theme';
import { topUpBridgeOption, topUpOnRampOption } from './helpers';
import { sendSwapWidgetCloseEvent } from './SwapWidgetEvents';

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

    if (!isValidAddress(params.fromContractAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "fromContractAddress" widget input');
      validatedParams.fromContractAddress = '';
    }

    if (!isValidAddress(params.toContractAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "toContractAddress" widget input');
      validatedParams.toContractAddress = '';
    }

    return validatedParams;
  }

  private isNotPassport = !isPassportProvider(this.web3Provider)
    || this.parameters?.walletProviderName !== WalletProviderName.PASSPORT;

  private topUpOptions(): { text: string; action: () => void }[] | undefined {
    const optionsArray: { text: string; action: () => void }[] = [];

    const isOnramp = topUpOnRampOption(this.strongConfig().isOnRampEnabled);
    if (isOnramp) {
      optionsArray.push({ text: isOnramp.text, action: isOnramp.action });
    }
    const isBridge = topUpBridgeOption(
      this.strongConfig().isBridgeEnabled,
      this.isNotPassport,
    );
    if (isBridge) {
      optionsArray.push({ text: isBridge.text, action: isBridge.action });
    }

    return optionsArray;
  }

  protected render() {
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER2,
      walletProviderName: this.parameters.walletProviderName,
      web3Provider: this.web3Provider,
      checkout: this.checkout,
      allowedChains: [getL2ChainId(this.checkout!.config)],
    };

    let isSwapAvailable = false;

    const topUpOptions = this.topUpOptions();

    const themeBase = widgetTheme(this.strongConfig().theme);

    if (!this.reactRoot) return;

    this.checkout
      ?.isSwapAvailable()
      .then((available) => {
        isSwapAvailable = available;
      })
      .finally(() => {
        this.reactRoot!.render(
          <React.StrictMode>
            <BiomePortalIdProvider>
              <CustomAnalyticsProvider widgetConfig={this.strongConfig()}>
                {!isSwapAvailable && (
                  <BiomeCombinedProviders theme={{ base: themeBase }}>
                    <ServiceUnavailableErrorView
                      service={ServiceType.SWAP}
                      onCloseClick={() => sendSwapWidgetCloseEvent(window)}
                      primaryActionText={
                        topUpOptions && topUpOptions?.length > 0
                          ? topUpOptions[0].text
                          : undefined
                      }
                      onPrimaryButtonClick={
                        topUpOptions && topUpOptions?.length > 0
                          ? topUpOptions[0].action
                          : undefined
                      }
                      secondaryActionText={
                        topUpOptions?.length === 2
                          ? topUpOptions[1].text
                          : undefined
                      }
                      onSecondaryButtonClick={
                        topUpOptions?.length === 2
                          ? topUpOptions[1].action
                          : undefined
                      }
                    />
                  </BiomeCombinedProviders>
                )}
                {isSwapAvailable && (
                  <ConnectLoader
                    params={connectLoaderParams}
                    widgetConfig={this.strongConfig()}
                    closeEvent={() => sendSwapWidgetCloseEvent(window)}
                  >
                    <Suspense fallback={<div>Loading..</div>}>
                      <SwapWidget
                        fromContractAddress={this.parameters.fromContractAddress}
                        toContractAddress={this.parameters.toContractAddress}
                        amount={this.parameters.amount}
                        config={this.strongConfig()}
                      />
                    </Suspense>
                  </ConnectLoader>
                )}
              </CustomAnalyticsProvider>
            </BiomePortalIdProvider>
          </React.StrictMode>,
        );
      });
  }
}

import React from 'react';
import {
  BridgeWidgetParams,
  ConnectTargetLayer,
  IMTBLWidgetEvents,
  WalletProviderName,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from 'widgets/BaseWidgetRoot';
import { ConnectLoader, ConnectLoaderParams } from 'components/ConnectLoader/ConnectLoader';
import { getL1ChainId } from 'lib';
import { isPassportProvider } from 'lib/providerUtils';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { BiomeCombinedProviders } from '@biom3/react';
import { widgetTheme } from 'lib/theme';
import { isValidWalletProvider, isValidAmount, isValidAddress } from 'lib/validations/widgetValidators';
import { BridgeComingSoon } from './views/BridgeComingSoon';
import { sendBridgeWidgetCloseEvent } from './BridgeWidgetEvents';
import { BridgeWidget } from './BridgeWidget';

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

    if (!isValidAddress(params.fromContractAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "fromContractAddress" widget input');
      validatedParams.fromContractAddress = '';
    }

    return validatedParams;
  }

  protected render() {
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER1,
      walletProviderName: this.parameters.walletProviderName,
      web3Provider: this.web3Provider,
      checkout: this.checkout,
      allowedChains: [getL1ChainId(this.checkout.config)],
    };

    const showBridgeComingSoonScreen = isPassportProvider(this.web3Provider)
      || this.parameters.walletProviderName === WalletProviderName.PASSPORT;

    if (!this.reactRoot) return;

    const theme = widgetTheme(this.strongConfig().theme);

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider
          widgetConfig={this.strongConfig()}
        >
          {showBridgeComingSoonScreen && (
            <BiomeCombinedProviders theme={{ base: theme }}>
              <BridgeComingSoon onCloseEvent={() => sendBridgeWidgetCloseEvent(window)} />
            </BiomeCombinedProviders>
          )}
          {!showBridgeComingSoonScreen && (
            <ConnectLoader
              params={connectLoaderParams}
              closeEvent={() => sendBridgeWidgetCloseEvent(window)}
              widgetConfig={this.strongConfig()}
            >
              <BridgeWidget
                amount={this.parameters.amount}
                fromContractAddress={this.parameters.fromContractAddress}
                config={this.strongConfig()}
              />
            </ConnectLoader>
          )}

        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

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
    { params, config }: WidgetProperties<WidgetType.BRIDGE>,
  ): WidgetProperties<WidgetType.BRIDGE> {
    let validatedParams: BridgeWidgetParams | undefined;
    let validatedConfig: WidgetConfiguration | undefined;

    if (params) {
      validatedParams = params;
      if (!isValidWalletProvider(params.walletProvider)) {
        // eslint-disable-next-line no-console
        console.warn('[IMTBL]: invalid "walletProvider" widget input');
        validatedParams.walletProvider = undefined;
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
    }

    if (config) {
      validatedConfig = config;
      if (config.theme === WidgetTheme.LIGHT) validatedConfig.theme = WidgetTheme.LIGHT;
      else validatedConfig.theme = WidgetTheme.DARK;
    }

    return {
      params: validatedParams,
      config: validatedConfig,
    };
  }

  protected render() {
    const { params } = this.properties;

    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER1,
      walletProvider: params?.walletProvider,
      web3Provider: params?.web3Provider,
      checkout: this.checkout,
      allowedChains: [getL1ChainId(this.checkout.config)],
    };

    const showBridgeComingSoonScreen = isPassportProvider(params?.web3Provider)
      || params?.walletProvider === WalletProviderName.PASSPORT;

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
                {...this.properties.params}
                config={this.strongConfig()}
              />
            </ConnectLoader>
          )}
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

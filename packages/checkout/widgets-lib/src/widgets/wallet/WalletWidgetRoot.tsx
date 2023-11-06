import React from 'react';
import {
  ConnectTargetLayer,
  IMTBLWidgetEvents,
  WalletWidgetParams,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from 'widgets/BaseWidgetRoot';
import { ConnectLoader, ConnectLoaderParams } from 'components/ConnectLoader/ConnectLoader';
import { getL1ChainId, getL2ChainId } from 'lib';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { isValidWalletProvider } from 'lib/validations/widgetValidators';
import { BiomePortalIdProvider } from '@biom3/react';
import { WalletWidget } from './WalletWidget';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';

export class Wallet extends Base<WidgetType.WALLET> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT;

  protected getValidatedProperties(
    { params, config }: WidgetProperties<WidgetType.WALLET>,
  ): WidgetProperties<WidgetType.WALLET> {
    let validatedParams: WalletWidgetParams | undefined;
    let validatedConfig: WidgetConfiguration | undefined;

    if (params) {
      validatedParams = params;
      if (!isValidWalletProvider(params.walletProviderName)) {
        // eslint-disable-next-line no-console
        console.warn('[IMTBL]: invalid "walletProviderName" widget input');
        validatedParams.walletProviderName = undefined;
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
      targetLayer: ConnectTargetLayer.LAYER2,
      walletProviderName: params?.walletProviderName,
      web3Provider: params?.web3Provider,
      checkout: this.checkout,
      allowedChains: [getL1ChainId(this.checkout.config), getL2ChainId(this.checkout.config)],
    };

    if (!this.reactRoot) return;

    this.reactRoot.render(
      <React.StrictMode>
        <BiomePortalIdProvider>
          <CustomAnalyticsProvider widgetConfig={this.strongConfig()}>
            <ConnectLoader
              widgetConfig={this.strongConfig()}
              params={connectLoaderParams}
              closeEvent={() => sendWalletWidgetCloseEvent(window)}
            >
              <WalletWidget
                config={this.strongConfig()}
              />
            </ConnectLoader>
          </CustomAnalyticsProvider>
        </BiomePortalIdProvider>
      </React.StrictMode>,
    );
  }
}

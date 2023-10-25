import React, { useMemo } from 'react';
import {
  ConnectTargetLayer,
  IMTBLWidgetEvents,
  WalletProviderName,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from 'widgets/BaseWidgetRoot';
import { ConnectLoader, ConnectLoaderParams } from 'components/ConnectLoader/ConnectLoader';
import { getL1ChainId } from 'lib';
import { isPassportProvider } from 'lib/providerUtils';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { BiomeCombinedProviders } from '@biom3/react';
import { widgetTheme } from 'lib/theme';
import { BridgeComingSoon } from './views/BridgeComingSoon';
import { sendBridgeWidgetCloseEvent } from './BridgeWidgetEvents';
import { BridgeWidget } from './BridgeWidget';

export class Bridge extends Base<WidgetType.BRIDGE> {
  protected eventTarget: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT;

  protected render() {
    this.validate(this.properties);

    const { params } = this.properties;

    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER1,
      walletProvider: params?.walletProvider,
      web3Provider: params?.web3Provider,
      passport: params?.passport,
      allowedChains: [getL1ChainId(this.checkout.config)],
    };

    const showBridgeComingSoonScreen = isPassportProvider(params?.web3Provider)
      || params?.walletProvider === WalletProviderName.PASSPORT;

    if (!this.reactRoot) return;

    const themeReducerValue = useMemo(
      () => widgetTheme(this.strongConfig().theme),
      [this.strongConfig().theme],
    );

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider
          widgetConfig={this.strongConfig()}
        >
          {showBridgeComingSoonScreen && (
            <BiomeCombinedProviders theme={{ base: themeReducerValue }}>
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

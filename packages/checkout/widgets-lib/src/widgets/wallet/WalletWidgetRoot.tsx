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
import { isValidWalletProvider } from 'lib/validations/widgetValidators';
import { ThemeProvider } from 'components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { Web3ModalContext } from 'context/web3modal-context';
import { WalletWidget } from './WalletWidget';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';

export class Wallet extends Base<WidgetType.WALLET> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT;

  protected getValidatedProperties(
    { config }: WidgetProperties<WidgetType.WALLET>,
  ): WidgetProperties<WidgetType.WALLET> {
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

  protected getValidatedParameters(params: WalletWidgetParams): WalletWidgetParams {
    const validatedParams = params;

    if (!isValidWalletProvider(params.walletProviderName)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "walletProviderName" widget input');
      validatedParams.walletProviderName = undefined;
    }
    return validatedParams;
  }

  protected render() {
    if (!this.reactRoot) return;

    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER2,
      walletProviderName: this.parameters?.walletProviderName,
      web3Provider: this.web3Provider,
      checkout: this.checkout,
      allowedChains: [getL1ChainId(this.checkout.config), getL2ChainId(this.checkout.config)],
    };

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="wallet-container" config={this.strongConfig()}>
            <Web3ModalContext.Provider value={{ web3Modal: this.web3Modal }}>
              <ConnectLoader
                widgetConfig={this.strongConfig()}
                params={connectLoaderParams}
                closeEvent={() => sendWalletWidgetCloseEvent(window)}
              >
                <WalletWidget
                  config={this.strongConfig()}
                />
              </ConnectLoader>
            </Web3ModalContext.Provider>
          </ThemeProvider>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

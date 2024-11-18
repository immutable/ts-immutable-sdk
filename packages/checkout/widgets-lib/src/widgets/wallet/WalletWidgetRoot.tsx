import React, { Suspense } from 'react';
import {
  ChainId,
  IMTBLWidgetEvents,
  WalletWidgetConfiguration,
  WalletWidgetParams,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from '../BaseWidgetRoot';
import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { getL1ChainId, getL2ChainId } from '../../lib';
import { isValidWalletProvider } from '../../lib/validations/widgetValidators';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { LoadingView } from '../../views/loading/LoadingView';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import { sendWalletWidgetCloseEvent } from './WalletWidgetEvents';
import i18n from '../../i18n';

const WalletWidget = React.lazy(() => import('./WalletWidget'));

export class Wallet extends Base<WidgetType.WALLET> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT;

  protected getValidatedProperties(
    { config }: WidgetProperties<WidgetType.WALLET>,
  ): WidgetProperties<WidgetType.WALLET> {
    let validatedConfig: WalletWidgetConfiguration | undefined;

    if (config) {
      validatedConfig = config;
      if (config.theme === WidgetTheme.LIGHT) validatedConfig.theme = WidgetTheme.LIGHT;
      else validatedConfig.theme = WidgetTheme.DARK;

      if (config?.showDisconnectButton === undefined) {
        validatedConfig.showDisconnectButton = true;
      } else {
        validatedConfig.showDisconnectButton = config.showDisconnectButton;
      }

      if (config?.showNetworkMenu === undefined) {
        validatedConfig.showNetworkMenu = true;
      } else {
        validatedConfig.showNetworkMenu = config.showNetworkMenu;
      }
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

    const { t } = i18n;
    const connectLoaderParams: ConnectLoaderParams = {
      targetChainId: this.checkout.config.isProduction
        ? ChainId.IMTBL_ZKEVM_MAINNET
        : ChainId.IMTBL_ZKEVM_TESTNET,
      browserProvider: this.browserProvider,
      checkout: this.checkout,
      allowedChains: [getL1ChainId(this.checkout.config), getL2ChainId(this.checkout.config)],
    };

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="wallet-container" config={this.strongConfig()}>
            <HandoverProvider>
              <ConnectLoader
                widgetConfig={this.strongConfig()}
                params={connectLoaderParams}
                closeEvent={() => sendWalletWidgetCloseEvent(window)}
              >
                <Suspense
                  fallback={
                    <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
                  }
                >
                  <WalletWidget
                    config={this.strongConfig()}
                    walletConfig={{
                      showDisconnectButton:
                        this.properties.config?.showDisconnectButton!,
                      showNetworkMenu: this.properties.config?.showNetworkMenu!,
                    }}
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

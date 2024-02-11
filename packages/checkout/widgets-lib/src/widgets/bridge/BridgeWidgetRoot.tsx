import React from 'react';
import {
  BridgeWidgetParams,
  IMTBLWidgetEvents,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from 'widgets/BaseWidgetRoot';
import { isValidWalletProvider, isValidAmount, isValidAddress } from 'lib/validations/widgetValidators';
import { BridgeWidget } from 'widgets/bridge/BridgeWidget';
import { ThemeProvider } from 'components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { Web3ModalContext } from 'context/web3modal-context';

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

    if (!isValidAddress(params.tokenAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "tokenAddress" widget input');
      validatedParams.tokenAddress = '';
    }

    return validatedParams;
  }

  protected render() {
    if (!this.reactRoot) return;
    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="bridge-container" config={this.strongConfig()}>
            <Web3ModalContext.Provider value={{ web3Modal: this.web3Modal }}>
              <BridgeWidget
                checkout={this.checkout}
                config={this.strongConfig()}
                web3Provider={this.web3Provider}
                tokenAddress={this.parameters.tokenAddress}
                amount={this.parameters.amount}
                walletProviderName={this.parameters.walletProviderName}
              />
            </Web3ModalContext.Provider>
          </ThemeProvider>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

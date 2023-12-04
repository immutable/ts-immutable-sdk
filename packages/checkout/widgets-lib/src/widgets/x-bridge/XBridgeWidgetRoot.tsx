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
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { isValidWalletProvider, isValidAmount, isValidAddress } from 'lib/validations/widgetValidators';
import { XBridgeWidget } from 'widgets/x-bridge/XBridgeWidget';

export class XBridge extends Base<WidgetType.BRIDGE> {
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
    if (!this.reactRoot) return;
    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider
          widgetConfig={this.strongConfig()}
        >
          <XBridgeWidget
            checkout={this.checkout}
            config={this.strongConfig()}
            web3Provider={this.web3Provider}
          />
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

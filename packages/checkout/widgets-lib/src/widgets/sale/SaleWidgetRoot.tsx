import React from 'react';
import {
  ConnectTargetLayer,
  IMTBLWidgetEvents,
  SaleWidgetParams,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from 'widgets/BaseWidgetRoot';
import { ConnectLoaderParams } from 'components/ConnectLoader/ConnectLoader';
import { getL1ChainId, getL2ChainId } from 'lib';
import { isValidWalletProvider } from 'lib/validations/widgetValidators';

export class Sale extends Base<WidgetType.SALE> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT;

  protected getValidatedProperties(
    { params, config }: WidgetProperties<WidgetType.SALE>,
  ): WidgetProperties<WidgetType.SALE> {
    let validatedParams: SaleWidgetParams | undefined;
    let validatedConfig: WidgetConfiguration | undefined;

    if (params) {
      validatedParams = params;
      if (!isValidWalletProvider(params.walletProvider)) {
        // eslint-disable-next-line no-console
        console.warn('[IMTBL]: invalid "walletProvider" widget input');
        validatedParams.walletProvider = undefined;
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
      walletProvider: params?.walletProvider,
      web3Provider: params?.web3Provider,
      checkout: this.checkout,
      allowedChains: [getL1ChainId(this.checkout.config), getL2ChainId(this.checkout.config)],
    };

    // TODO: remove this
    // eslint-disable-next-line no-console
    console.log(connectLoaderParams);

    if (!this.reactRoot) return;

    this.reactRoot.render(
      <React.StrictMode />,
    );
  }
}

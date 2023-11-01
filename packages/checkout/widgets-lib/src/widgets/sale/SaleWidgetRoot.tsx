import React from 'react';
import {
  ConnectTargetLayer,
  IMTBLWidgetEvents,
  SaleItem,
  SaleWidgetParams,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from 'widgets/BaseWidgetRoot';
import { ConnectLoader, ConnectLoaderParams } from 'components/ConnectLoader/ConnectLoader';
import { getL2ChainId } from 'lib';
import { isValidAmount, isValidWalletProvider } from 'lib/validations/widgetValidators';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { sendSaleWidgetCloseEvent } from './SaleWidgetEvents';
import { SaleWidget } from './SaleWidget';

export class Sale extends Base<WidgetType.SALE> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT;

  // TODO: add specific validation logic for the sale items
  private isValidProucts(products: SaleItem[]): boolean {
    try {
      return Array.isArray(products);
    } catch {
      return false;
    }
  }

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
      if (!isValidAmount(params.amount)) {
        // eslint-disable-next-line no-console
        console.warn('[IMTBL]: invalid "amount" widget input');
        validatedParams.amount = '';
      }

      // TODO: fix the logic here when proper , currently saying if valid then reset to empty array.
      if (this.isValidProucts(params.items ?? [])) {
        // eslint-disable-next-line no-console
        console.warn('[IMTBL]: invalid "items" widget input.');
        validatedParams.items = [];
      }

      if (!params.environmentId) {
        // eslint-disable-next-line no-console
        console.warn('[IMTBL]: invalid "environmentId" widget input');
        validatedParams.environmentId = '';
      }

      if (!params.fromContractAddress) {
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
      targetLayer: ConnectTargetLayer.LAYER2,
      web3Provider: this.properties.params?.web3Provider,
      checkout: this.checkout,
      allowedChains: [
        getL2ChainId(this.checkout!.config),
      ],
    };

    if (!this.reactRoot) return;

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider widgetConfig={this.strongConfig()}>
          <ConnectLoader
            widgetConfig={this.strongConfig()}
            params={connectLoaderParams}
            closeEvent={() => {
              sendSaleWidgetCloseEvent(window);
            }}
          >
            <SaleWidget
              config={this.strongConfig()}
              amount={params!.amount!}
              items={params!.items!}
              fromContractAddress={params!.fromContractAddress!}
              environmentId={params!.environmentId!}
            />
          </ConnectLoader>
        </CustomAnalyticsProvider>
      </React.StrictMode>,
    );
  }
}

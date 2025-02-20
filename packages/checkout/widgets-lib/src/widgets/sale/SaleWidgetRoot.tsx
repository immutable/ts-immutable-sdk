import React, { Suspense } from 'react';
import {
  ChainId,
  IMTBLWidgetEvents,
  SaleItem,
  SaleWidgetParams,
  WidgetConfiguration,
  WidgetLanguage,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from '../BaseWidgetRoot';
import {
  ConnectLoader,
  ConnectLoaderParams,
} from '../../components/ConnectLoader/ConnectLoader';
import { getL2ChainId } from '../../lib';
import { isValidWalletProvider } from '../../lib/validations/widgetValidators';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { LoadingView } from '../../views/loading/LoadingView';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import { sendSaleWidgetCloseEvent } from './SaleWidgetEvents';
import i18n from '../../i18n';

const SaleWidget = React.lazy(() => import('./SaleWidget'));

export class Sale extends Base<WidgetType.SALE> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT;

  // TODO: add specific validation logic for the sale items
  private isValidArray(items: SaleItem[] | undefined): boolean {
    try {
      return Array.isArray(items);
    } catch {
      return false;
    }
  }

  private deduplicateItems(items: SaleItem[] | undefined): SaleItem[] {
    if (!items || !this.isValidArray(items)) return [];

    const uniqueItems = items.reduce((acc, item) => {
      const itemIndex = acc.findIndex(
        ({ productId }) => productId === item.productId,
      );

      if (itemIndex !== -1) {
        acc[itemIndex] = { ...item, qty: acc[itemIndex].qty + item.qty };
        return acc;
      }

      return [...acc, { ...item }];
    }, [] as SaleItem[]);

    return uniqueItems;
  }

  protected getValidatedProperties({
    config,
  }: WidgetProperties<WidgetType.SALE>): WidgetProperties<WidgetType.SALE> {
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

  protected getValidatedParameters(params: SaleWidgetParams): SaleWidgetParams {
    const validatedParams = params;
    if (!isValidWalletProvider(params.walletProviderName)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "walletProviderName" widget input');
      validatedParams.walletProviderName = undefined;
    }

    if (!this.isValidArray(params.items)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "items" widget input.');
      validatedParams.items = [];
    }

    if (!params.environmentId) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "environmentId" widget input');
      validatedParams.environmentId = '';
    }

    if (!params.collectionName) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "collectionName" widget input');
      validatedParams.collectionName = '';
    }

    if (
      params.excludePaymentTypes !== undefined
      && !Array.isArray(params.excludePaymentTypes)
    ) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "excludePaymentTypes" widget input');
      validatedParams.excludePaymentTypes = [];
    }

    return {
      ...validatedParams,
      items: this.deduplicateItems(params.items),
    };
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
      allowedChains: [getL2ChainId(this.checkout!.config)],
    };
    const config = this.strongConfig();

    this.reactRoot.render(
      <React.StrictMode>
        <CustomAnalyticsProvider checkout={this.checkout}>
          <ThemeProvider id="sale-container" config={config}>
            <HandoverProvider>
              <ConnectLoader
                widgetConfig={config}
                params={connectLoaderParams}
                closeEvent={() => {
                  sendSaleWidgetCloseEvent(window);
                }}
              >
                <Suspense
                  fallback={
                    <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
                  }
                >
                  <SaleWidget
                    config={config}
                    items={this.parameters.items!}
                    language={this.parameters.language as WidgetLanguage}
                    environmentId={this.parameters.environmentId!}
                    collectionName={this.parameters.collectionName!}
                    excludePaymentTypes={this.parameters.excludePaymentTypes!}
                    excludeFiatCurrencies={
                      this.parameters.excludeFiatCurrencies!
                    }
                    preferredCurrency={this.parameters.preferredCurrency!}
                    customOrderData={this.parameters.customOrderData!}
                    hideExcludedPaymentTypes={
                      this.properties?.config?.hideExcludedPaymentTypes ?? false
                    }
                    waitFulfillmentSettlements={
                      this.properties?.config?.waitFulfillmentSettlements
                      ?? true
                    }
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

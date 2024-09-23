import {
  IMTBLWidgetEvents,
  CheckoutWidgetConfiguration,
  CheckoutWidgetParams,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
  CheckoutWidgetConnectFlowParams,
  CheckoutWidgetWalletFlowParams,
  CheckoutWidgetAddFundsFlowParams,
  CheckouWidgetSwapFlowParams,
  CheckouWidgetBridgeFlowParams,
  CheckouWidgetOnRampFlowParams,
  CheckouWidgetSaleFlowParams,
  CheckoutFlowType,
} from '@imtbl/checkout-sdk';
import React, { Suspense } from 'react';
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider';
import { CustomAnalyticsProvider } from '../../context/analytics-provider/CustomAnalyticsProvider';
import { HandoverProvider } from '../../context/handover-context/HandoverProvider';
import { LoadingView } from '../../views/loading/LoadingView';
import { Base } from '../BaseWidgetRoot';
import i18n from '../../i18n';
import {
  isValidAddress,
  isValidAmount,
  isValidWalletProvider,
} from '../../lib/validations/widgetValidators';
import { deduplicateSaleItemsArray } from './functions/deduplicateSaleItemsArray';
import { checkoutFlows } from './functions/isValidCheckoutFlow';

const CheckoutWidget = React.lazy(() => import('./CheckoutWidget'));

export class CheckoutWidgetRoot extends Base<WidgetType.CHECKOUT> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT;

  protected getValidatedProperties({
    config,
  }: WidgetProperties<WidgetType.CHECKOUT>): WidgetProperties<WidgetType.CHECKOUT> {
    let validatedConfig: CheckoutWidgetConfiguration | undefined;

    if (config) {
      validatedConfig = config;
      // FIXME: Move default theme initialisation to Base class
      if (config.theme === WidgetTheme.LIGHT) validatedConfig.theme = WidgetTheme.LIGHT;
      else validatedConfig.theme = WidgetTheme.DARK;
    }

    // TODO: validate configs for each widget
    return {
      config: validatedConfig,
    };
  }

  protected getValidConnectFlowParams(params: CheckoutWidgetConnectFlowParams) {
    const validatedParams = { ...params };

    if (!Array.isArray(validatedParams.blocklistWalletRdns)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "blocklistWalletRdns" widget input');
      validatedParams.blocklistWalletRdns = [];
    }

    return validatedParams;
  }

  protected getValidWalletFlowParams(params: CheckoutWidgetWalletFlowParams) {
    return params;
  }

  protected getValidSaleFlowParams(params: CheckouWidgetSaleFlowParams) {
    const validatedParams = { ...params };

    if (!isValidWalletProvider(params.walletProviderName)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "walletProviderName" widget input');
      validatedParams.walletProviderName = undefined;
    }

    if (!Array.isArray(validatedParams.items)) {
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
      items: deduplicateSaleItemsArray(params.items),
    };
  }

  protected getValidAddFundsFlowParams(
    params: CheckoutWidgetAddFundsFlowParams,
  ) {
    const validatedParams = { ...params };

    if (validatedParams.showBridgeOption) {
      validatedParams.showBridgeOption = true;
    }

    if (validatedParams.showOnrampOption) {
      validatedParams.showOnrampOption = true;
    }

    if (validatedParams.showSwapOption) {
      validatedParams.showSwapOption = true;
    }

    if (!isValidAmount(validatedParams.toAmount)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "toAmount" widget input');
      validatedParams.toAmount = '';
    }

    if (!isValidAddress(params.toTokenAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "toTokenAddress" widget input');
      validatedParams.toTokenAddress = '';
    }

    return validatedParams;
  }

  protected getValidSwapFlowParams(params: CheckouWidgetSwapFlowParams) {
    const validatedParams = { ...params };

    if (!isValidAmount(params.amount)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "amount" widget input');
      validatedParams.amount = '';
    }

    if (!isValidAddress(params.fromTokenAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "fromTokenAddress" widget input');
      validatedParams.fromTokenAddress = '';
    }

    if (!isValidAddress(params.toTokenAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "toTokenAddress" widget input');
      validatedParams.toTokenAddress = '';
    }

    if (params.autoProceed) {
      validatedParams.autoProceed = true;
    }

    return validatedParams;
  }

  protected getValidBridgeFlowParams(params: CheckouWidgetBridgeFlowParams) {
    const validatedParams = { ...params };

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

  protected getValidOnRampFlowParams(params: CheckouWidgetOnRampFlowParams) {
    const validatedParams = { ...params };

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

  protected getValidatedParameters(
    params: CheckoutWidgetParams,
  ): CheckoutWidgetParams {
    // if empty do nothing
    if (Object.keys(params).length === 0) {
      return params;
    }

    const flowType = params.flow;
    const supportedFlows = checkoutFlows.join(', ');

    switch (flowType) {
      case CheckoutFlowType.CONNECT:
        return this.getValidConnectFlowParams(params);
      case CheckoutFlowType.WALLET:
        return this.getValidWalletFlowParams(params);
      case CheckoutFlowType.SALE:
        return this.getValidSaleFlowParams(params);
      case CheckoutFlowType.SWAP:
        return this.getValidSwapFlowParams(params);
      case CheckoutFlowType.BRIDGE:
        return this.getValidBridgeFlowParams(params);
      case CheckoutFlowType.ONRAMP:
        return this.getValidOnRampFlowParams(params);
      case CheckoutFlowType.ADD_FUNDS:
        return this.getValidAddFundsFlowParams(params);
      default:
        throw new Error(
          `[IMTBL]: invalid "flow: ${flowType}" widget input, must be one of the following: ${supportedFlows}`,
        );
    }
  }

  protected render() {
    if (!this.reactRoot) return;

    const { t } = i18n;

    this.reactRoot.render(
      <CustomAnalyticsProvider checkout={this.checkout}>
        <ThemeProvider id="checkout-container" config={this.strongConfig()}>
          <HandoverProvider>
            <Suspense
              fallback={
                <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
              }
            >
              <CheckoutWidget
                checkout={this.checkout}
                web3Provider={this.web3Provider}
                flowParams={this.parameters}
                flowConfig={this.properties.config || {}}
                widgetsConfig={this.strongConfig()}
              />
            </Suspense>
          </HandoverProvider>
        </ThemeProvider>
      </CustomAnalyticsProvider>,
    );
  }
}

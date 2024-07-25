import {
  CheckoutFlowType,
  CheckoutWidgetConfiguration,
  CheckoutWidgetParams,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';

import { CHECKOUT_APP_URL } from '../../../lib/constants';

const toQueryString = (params: Record<string, unknown>): string => {
  const sanitizedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => [key, value] as [string, string]);

  return new URLSearchParams(sanitizedParams).toString();
};

// TODO: Can be removed after updating params across widgets
const getIframeParams = (
  params: CheckoutWidgetParams,
  config: CheckoutWidgetConfiguration,
): string => {
  const { flow } = params;
  const commonConfig = {
    theme: config.theme,
  };

  switch (flow) {
    case CheckoutFlowType.CONNECT:
      return toQueryString({
        ...commonConfig,
        ...(config.connect || {}),
        chainId: params.targetChainId,
        walletRdns: params.targetWalletRdns,
        blocklistWalletRdns: params.blocklistWalletRdns,
      });
    case CheckoutFlowType.WALLET:
      return toQueryString({
        ...commonConfig,
        ...(config.wallet || {}),
        // FIMXE: Add connection params
        // chainId:
        // walletRdns:
        // blocklistWalletRdns:

        // FIXME: remove walletProviderName
        walletProviderName: params.walletProviderName,
      });
    case CheckoutFlowType.SWAP:
      return toQueryString({
        ...commonConfig,
        ...(config.swap || {}),
        // FIMXE: Add connection params
        // chainId:
        // walletRdns:
        // blocklistWalletRdns:

        // FIXME: remove walletProviderName
        walletProviderName: params.walletProviderName,
        fromToken: params.fromTokenAddress,
        fromAmount: params.amount,
        toToken: params.toTokenAddress,
      });
    case CheckoutFlowType.BRIDGE:
      return toQueryString({
        ...commonConfig,
        ...(config.bridge || {}),
        // FIMXE: Add bridge params
        // fromChainId:
        // toChainId:
        // toToken:
        // toAmount:

        // FIXME: remove walletProviderName
        walletProviderName: params.walletProviderName,
        fromToken: params.tokenAddress,
        fromAmount: params.amount,
      });
    case CheckoutFlowType.ONRAMP:
      return toQueryString({
        ...commonConfig,
        ...(config.onRamp || {}),
        // FIMXE: Add connection params
        // chainId:
        // walletRdns:
        // blocklistWalletRdns:

        // FIXME: remove walletProviderName
        walletProviderName: params.walletProviderName,
        toToken: params.amount,
        toAmount: params.tokenAddress,
      });
    case CheckoutFlowType.SALE:
      return toQueryString({
        ...commonConfig,
        ...(config.sale || {}),
        // FIMXE: Add connection params
        // chainId:
        // walletRdns:
        // blocklistWalletRdns:

        // FIXME: remove walletProviderName
        walletProviderName: params.walletProviderName,

        // TODO: Get from hub
        environmentId: params.environmentId,
        collectionName: params.collectionName,

        items: params.items,
        preferredCurrency: params.preferredCurrency,
        excludePaymentTypes: params.excludePaymentTypes,
        excludeFiatCurrencies: params.excludeFiatCurrencies,
      });
    default:
      return '';
  }
};

export const getIframeURL = (
  params: CheckoutWidgetParams,
  config: CheckoutWidgetConfiguration,
  environment: Environment,
  publishableKey: string,
): string => {
  const { flow } = params;

  const language = params.language || config.language;

  const baseUrl = CHECKOUT_APP_URL[environment];
  const queryParams = getIframeParams(params, config);

  return `${baseUrl}/${publishableKey}/${language}/${flow}?${queryParams}`;
};

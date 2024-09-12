/* eslint-disable no-case-declarations */
import {
  CheckoutConfiguration,
  CheckoutFlowType,
  CheckoutWidgetConfiguration,
  CheckoutWidgetParams,
} from '@imtbl/checkout-sdk';

import { Environment } from '@imtbl/config';

import { encodeObject } from '../utils/encode';
import { CHECKOUT_APP_URL, ENV_DEVELOPMENT } from '../../../lib/constants';

/**
 * Converts a record of parameters to a query string.
 */
const toQueryString = (params: Record<string, unknown>): string => {
  const sanitizedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const safeValue = Array.isArray(value) || typeof value === 'object'
        ? JSON.stringify(value)
        : value;

      return [key, safeValue];
    })
    .map(([key, value]) => [key, value] as [string, string]);

  return new URLSearchParams(sanitizedParams).toString();
};

/**
 * Maps the flow configuration and params to the corresponding query parameters.
 */
const getIframeParams = async (
  params: CheckoutWidgetParams,
  widgetConfig: CheckoutWidgetConfiguration,
  checkoutConfig: CheckoutConfiguration,
): Promise<string> => {
  const { flow } = params;
  const commonConfig = {
    theme: widgetConfig.theme,
    language: widgetConfig.language,
    publishableKey: checkoutConfig.publishableKey,
    sdkVersion: checkoutConfig.sdkVersion,
  };

  switch (flow) {
    case CheckoutFlowType.CONNECT:
      return toQueryString({
        ...commonConfig,
        ...(widgetConfig.connect || {}),
        chainId: params.targetChainId,
        walletRdns: params.targetWalletRdns,
        blocklistWalletRdns: params.blocklistWalletRdns,
      });
    case CheckoutFlowType.WALLET:
      return toQueryString({
        ...commonConfig,
        ...(widgetConfig.wallet || {}),
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
        ...(widgetConfig.swap || {}),
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
        ...(widgetConfig.bridge || {}),
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
        ...(widgetConfig.onRamp || {}),
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
      const items = await encodeObject(params.items || []);

      return toQueryString({
        ...commonConfig,
        ...(widgetConfig.sale || {}),
        // FIMXE: Add connection params
        // chainId:
        // walletRdns:
        // blocklistWalletRdns:

        // FIXME: remove walletProviderName
        walletProviderName: params.walletProviderName,

        // TODO: Get from hub
        environmentId: params.environmentId,
        collectionName: params.collectionName,

        items,
        preferredCurrency: params.preferredCurrency,
        excludePaymentTypes: params.excludePaymentTypes,
        excludeFiatCurrencies: params.excludeFiatCurrencies,
      });
    default:
      return '';
  }
};

/**
 * Returns the iframe URL for the Checkout App based on the environment.
 */
export const getIframeURL = async (
  params: CheckoutWidgetParams,
  widgetConfig: CheckoutWidgetConfiguration,
  checkoutConfig: CheckoutConfiguration,
): Promise<string> => {
  const { flow } = params;
  const { publishableKey } = checkoutConfig;

  if (!publishableKey) return '';

  let environment: Environment = checkoutConfig.environment || Environment.SANDBOX;
  if (checkoutConfig.isDevelopment) {
    environment = ENV_DEVELOPMENT;
  }

  if (checkoutConfig.overrides?.environment) {
    environment = checkoutConfig.overrides.environment;
  }

  const baseURL = (checkoutConfig.overrides?.checkoutAppUrl as string)
    ?? CHECKOUT_APP_URL[environment];
  const queryParams = await getIframeParams(
    params,
    widgetConfig,
    checkoutConfig,
  );

  const iframeURL = `${baseURL}/${flow}?${queryParams}`;

  return iframeURL;
};

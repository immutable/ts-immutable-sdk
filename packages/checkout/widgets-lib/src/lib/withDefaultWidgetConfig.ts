import { Environment } from '@imtbl/config';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import {
  DEFAULT_BRIDGE_ENABLED,
  DEFAULT_ENV,
  DEFAULT_ON_RAMP_ENABLED,
  DEFAULT_SWAP_ENABLED,
  DEFAULT_FIAT_PAYMENT_ENABLED,
  DEFAULT_THEME,
} from './constants';

export type StrongCheckoutWidgetsConfig = {
  theme: WidgetTheme;
  environment: Environment;
  isOnRampEnabled: boolean;
  isSwapEnabled: boolean;
  isBridgeEnabled: boolean;
  isFiatPaymentEnabled: boolean;
};

function getValidTheme(theme?: string): WidgetTheme {
  if (!theme) return DEFAULT_THEME;
  if (!Object.values(WidgetTheme).includes(theme as WidgetTheme)) return DEFAULT_THEME;
  return theme as WidgetTheme;
}

function getValidEnvironment(env?: string): Environment {
  if (!env) return DEFAULT_ENV;
  if (!Object.values(Environment).includes(env as Environment)) return DEFAULT_ENV;
  return env as Environment;
}

function getValidBoolean(defaultValue: boolean, value?: string): boolean {
  if (!value) return defaultValue;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

export const withDefaultWidgetConfigs = (
  configs?: any,
): StrongCheckoutWidgetsConfig => ({
  theme: getValidTheme(configs?.theme),
  environment: getValidEnvironment(configs?.environment),
  isOnRampEnabled: getValidBoolean(
    DEFAULT_ON_RAMP_ENABLED,
    configs?.isOnRampEnabled?.toString(),
  ),
  isSwapEnabled: getValidBoolean(
    DEFAULT_SWAP_ENABLED,
    configs?.isSwapEnabled?.toString(),
  ),
  isBridgeEnabled: getValidBoolean(
    DEFAULT_BRIDGE_ENABLED,
    configs?.isBridgeEnabled?.toString(),
  ),
  isFiatPaymentEnabled: getValidBoolean(
    DEFAULT_FIAT_PAYMENT_ENABLED,
    configs?.isFiatPaymentEnabled?.toString(),
  ),
});

import { CheckoutWidgetsConfig, WidgetTheme } from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import {
  DEFAULT_BRIDGE_ENABLED,
  DEFAULT_ENV,
  DEFAULT_ON_RAMP_ENABLED,
  DEFAULT_SWAP_ENABLED,
  DEFAULT_THEME,
} from './constants';

export type StrongCheckoutWidgetsConfig = {
  theme: WidgetTheme;
  environment: Environment;
  isOnRampEnabled: boolean;
  isSwapEnabled: boolean;
  isBridgeEnabled: boolean;
};

function getValidTheme(theme?: string): WidgetTheme {
  switch (theme) {
    case 'light':
      return WidgetTheme.LIGHT;
    case 'dark':
      return WidgetTheme.DARK;
    case 'custom':
      return WidgetTheme.CUSTOM;
    default:
      return DEFAULT_THEME;
  }
}

function getValidEnvironment(env?: string): Environment {
  switch (env) {
    case 'production':
      return Environment.PRODUCTION;
    case 'sandbox':
      return Environment.SANDBOX;
    default:
      return DEFAULT_ENV;
  }
}

function getValidBoolean(defaultValue: boolean, value?: string): boolean {
  switch (value?.toLowerCase()) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return defaultValue;
  }
}

export const withDefaultWidgetConfigs = (
  configs?: CheckoutWidgetsConfig,
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
});

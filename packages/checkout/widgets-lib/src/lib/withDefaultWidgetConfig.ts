import { Environment } from '@imtbl/config';
import { ThemeOverrides, WidgetTheme } from '@imtbl/checkout-sdk';
import {
  DEFAULT_ADD_TOKENS_ENABLED,
  DEFAULT_BRIDGE_ENABLED,
  DEFAULT_ENV,
  DEFAULT_ON_RAMP_ENABLED,
  DEFAULT_SWAP_ENABLED,
  DEFAULT_THEME,
} from './constants';

export type StrongCheckoutWidgetsConfig = {
  theme: WidgetTheme;
  themeOverrides: ThemeOverrides;
  environment: Environment;
  isOnRampEnabled: boolean;
  isSwapEnabled: boolean;
  isBridgeEnabled: boolean;
  isAddTokensEnabled: boolean;
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
  configs: {
    theme: WidgetTheme | undefined;
    themeOverrides: ThemeOverrides | undefined;
    environment: Environment;
    isOnRampEnabled: boolean;
    isSwapEnabled: boolean;
    isBridgeEnabled: boolean;
    isAddTokensEnabled?: boolean; // TODO: why is this optional?
  },
): StrongCheckoutWidgetsConfig => ({
  theme: getValidTheme(configs?.theme),
  themeOverrides: configs?.themeOverrides ?? {},
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
  isAddTokensEnabled: getValidBoolean(
    DEFAULT_ADD_TOKENS_ENABLED,
    configs?.isAddTokensEnabled?.toString(),
  ),
});

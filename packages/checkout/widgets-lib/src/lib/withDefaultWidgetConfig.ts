import { Environment } from '@imtbl/config';
import {
  DEFAULT_BRIDGE_ENABLED,
  DEFAULT_ENV,
  DEFAULT_ON_RAMP_ENABLED,
  DEFAULT_SWAP_ENABLED,
  DEFAULT_THEME,
} from './constants';
import { WidgetTheme } from './types';

export type StrongCheckoutWidgetsConfig = {
  theme: WidgetTheme;
  environment: Environment;
  isOnRampEnabled: boolean;
  isSwapEnabled: boolean;
  isBridgeEnabled: boolean;
};

function getValidTheme(theme?: string): WidgetTheme {
  if (!theme) return DEFAULT_THEME;
  if (theme === WidgetTheme.LIGHT) return WidgetTheme.LIGHT;
  if (theme === WidgetTheme.DARK) return WidgetTheme.DARK;
  if (theme === WidgetTheme.CUSTOM) return WidgetTheme.CUSTOM;
  return DEFAULT_THEME;
}

function getValidEnvironment(env?: string): Environment {
  if (!env) return DEFAULT_ENV;
  if (env === Environment.PRODUCTION) return Environment.PRODUCTION;
  if (env === Environment.SANDBOX) return Environment.SANDBOX;
  return DEFAULT_ENV;
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
  // TODO https://immutable.atlassian.net/browse/WT-1509
  // isOnRampEnabled: getValidBoolean(
  //   DEFAULT_ON_RAMP_ENABLED,
  //   configs?.isOnRampEnabled?.toString(),
  // ),
  isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
  isSwapEnabled: getValidBoolean(
    DEFAULT_SWAP_ENABLED,
    configs?.isSwapEnabled?.toString(),
  ),
  isBridgeEnabled: getValidBoolean(
    DEFAULT_BRIDGE_ENABLED,
    configs?.isBridgeEnabled?.toString(),
  ),
});

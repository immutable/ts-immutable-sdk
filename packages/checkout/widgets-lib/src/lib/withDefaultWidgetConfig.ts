import {
  CheckoutWidgetsConfig,
  DEFAULT_BRIDGE_ENABLED,
  DEFAULT_ENV,
  DEFAULT_ON_RAMP_ENABLED,
  DEFAULT_SWAP_ENABLED,
  DEFAULT_THEME,
  WidgetTheme,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

export type StrongCheckoutWidgetsConfig = {
  theme: WidgetTheme;
  environment: Environment;
  isOnRampEnabled: boolean;
  isSwapEnabled: boolean;
  isBridgeEnabled: boolean;
};

export const withDefaultWidgetConfigs = (
  configs?: CheckoutWidgetsConfig,
): StrongCheckoutWidgetsConfig => ({
  theme: configs?.theme ?? DEFAULT_THEME,
  environment: configs?.environment ?? DEFAULT_ENV,
  isOnRampEnabled: configs?.isOnRampEnabled ?? DEFAULT_ON_RAMP_ENABLED,
  isSwapEnabled: configs?.isSwapEnabled ?? DEFAULT_SWAP_ENABLED,
  isBridgeEnabled: configs?.isBridgeEnabled ?? DEFAULT_BRIDGE_ENABLED,
});

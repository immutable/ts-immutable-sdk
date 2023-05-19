import {
  CheckoutWidgetsConfig,
  DEFAULT_ENV,
  DEFAULT_THEME,
  WidgetTheme,
} from '@imtbl/checkout-widgets/src';
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
  isOnRampEnabled: configs?.isOnRampEnabled ?? true,
  isSwapEnabled: configs?.isSwapEnabled ?? true,
  isBridgeEnabled: configs?.isBridgeEnabled ?? true,
});

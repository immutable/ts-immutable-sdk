import { Environment } from '@imtbl/config';
import { CheckoutWidgetsConfig } from '../definitions/config';
import {
  DEFAULT_ENV,
  DEFAULT_THEME,
  WidgetTheme,
} from '../definitions/constants';

type StrongCheckoutWidgetsConfig = {
  theme: WidgetTheme;
  environment: Environment;
};

export const withDefaults = (
  configs: CheckoutWidgetsConfig,
): StrongCheckoutWidgetsConfig => ({
  theme: configs.theme ?? DEFAULT_THEME,
  environment: configs.environment ?? DEFAULT_ENV,
});

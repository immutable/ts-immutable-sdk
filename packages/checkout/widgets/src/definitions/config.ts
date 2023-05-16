import { Environment } from '@imtbl/config';
import { WidgetTheme } from './constants';

/**
 * Represents the configuration options for the Checkout Widgets.
 * @property {WidgetTheme} theme - The theme of the Checkout Widget (default: "DARK")
 * @property {Environment} environment - The environment configuration (default: "SANDBOX")
 */
export type CheckoutWidgetsConfig = {
  theme?: WidgetTheme;
  environment?: Environment;
};

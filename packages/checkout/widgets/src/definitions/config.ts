import { Environment } from '@imtbl/config';
import { WidgetTheme } from './types';

/**
 * Represents the configuration options for the Checkout Widgets.
 * @property {WidgetTheme} theme - The theme of the Checkout Widget (default: "DARK")
 * @property {Environment} environment - The environment configuration (default: "SANDBOX")
 * @property {boolean} isOnRampEnabled - Enable on-ramp top-up method (default: "true")
 * @property {boolean} isSwapEnabled - Enable swap top-up method (default: "true")
 * @property {boolean} isBridgeEnabled - Enable bridge top-up method (default: "true")
 */
export type CheckoutWidgetsConfig = {
  theme?: WidgetTheme;
  environment?: Environment;
  isOnRampEnabled?: boolean;
  isSwapEnabled?: boolean;
  isBridgeEnabled?: boolean;
};

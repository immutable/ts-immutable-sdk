import { Environment } from '@imtbl/config';
import { WidgetTheme } from './constants';

/**
 * Represents the configuration options for the Checkout Widgets.
 * @property {WidgetTheme} theme - The theme of the Checkout Widget.
 * @property {Environment} environment - The environment configuration
 */
export type CheckoutWidgetsConfig = {
  theme?: WidgetTheme;
  environment: Environment;
};

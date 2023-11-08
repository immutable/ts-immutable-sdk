import { WidgetTheme } from './theme';

/**
 * Represents the local configuration options for the Checkout Widgets.
 * @property {WidgetTheme | undefined} theme - The theme of the Checkout Widget (default: "DARK")
 */
export type WidgetConfiguration = {
  theme?: WidgetTheme;
};

import { WidgetConfiguration } from './widget';

/**
 * Onramp Widget Configuration represents the configuration options for the Onramp Widget.
 */
export type OnrampWidgetConfiguration = {
  /** Whether to hide the menu in the Transak widget (default: true) */
  hideMenu?: boolean;
  /** The title to display on the exchange screen in the Transak widget (default: ' ') */
  exchangeScreenTitle?: string;
} & WidgetConfiguration;

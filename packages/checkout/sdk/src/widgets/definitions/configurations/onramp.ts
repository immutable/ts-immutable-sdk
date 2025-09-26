import { WidgetConfiguration } from './widget';

/**
 * Onramp Widget Configuration represents the configuration options for the Onramp Widget.
 */
export type OnrampWidgetConfiguration = {
  /** Whether to show the menu in the Transak widget (default: true) */
  showMenu?: boolean;
  /** The custom title to display in the widget header */
  customTitle?: string;
  /** The custom subtitle to display on the exchange screen in the Transak widget (default: 'Buy') */
  customSubTitle?: string;
  /** Whether to show the header (default: true) */
  showHeader?: boolean;
} & WidgetConfiguration;

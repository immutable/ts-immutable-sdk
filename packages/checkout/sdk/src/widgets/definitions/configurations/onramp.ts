import { WidgetConfiguration } from './widget';

/**
 * Onramp Widget Configuration represents the configuration options for the Onramp Widget.
 */
export type OnrampWidgetConfiguration = {
  /** Whether to show the menu in the Transak widget (default: false) */
  showMenu?: boolean;
  /** The custom subtitle to display on the exchange screen in the Transak widget (default: 'Buy') */
  customSubTitle?: string;
} & WidgetConfiguration;

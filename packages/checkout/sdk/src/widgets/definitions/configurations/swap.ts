import { WidgetConfiguration } from './widget';

/**
 * Swap Widget Configuration represents the configuration options for the Swap Widget.
 */
export type SwapWidgetConfiguration = {
  showTitle?: boolean;
  showSubTitle?: boolean;
} & WidgetConfiguration;

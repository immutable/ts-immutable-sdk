import { WidgetConfiguration } from './widget';

/**
 * Swap Widget Configuration represents the configuration options for the Swap Widget.
 */
export type SwapWidgetConfiguration = {
  customTitle?: string;
  customSubTitle?: string;
  transparentOverlay?: boolean;
} & WidgetConfiguration;

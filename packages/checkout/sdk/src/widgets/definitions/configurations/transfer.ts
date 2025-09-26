import { WidgetConfiguration } from './widget';

/**
 * Transfer Widget Configuration represents the configuration options for the Transfer Widget.
 */
export type TransferWidgetConfiguration = {
  customTitle?: string;
  transparentOverlay?: boolean;
  showHeader?: boolean;
} & WidgetConfiguration;

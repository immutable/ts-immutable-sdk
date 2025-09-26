import { WidgetConfiguration } from './widget';

/**
 * Bridge Widget Configuration represents the configuration options for the Bridge Widget.
 */
export type BridgeWidgetConfiguration = {
  transparentOverlay?: boolean;
} & WidgetConfiguration;

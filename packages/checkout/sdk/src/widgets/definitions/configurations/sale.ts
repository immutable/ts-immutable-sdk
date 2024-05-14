import { WidgetConfiguration } from './widget';

/**
 * Sale Widget Configuration represents the configuration options for the Sale Widget.
 */
export type SaleWidgetConfiguration = {
  multicurrency?: boolean;
  waitFulfillmentSettlements?: boolean;
} & WidgetConfiguration;

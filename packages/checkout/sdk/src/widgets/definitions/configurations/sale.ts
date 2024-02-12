import { WidgetConfiguration } from './widget';
import { SalePaymentTypes } from '../events/sale';

/**
 * Sale Widget Configuration represents the configuration options for the Sale Widget.
 */
export type SaleWidgetConfiguration = {
  disabledPaymentTypes?: [SalePaymentTypes];
} & WidgetConfiguration;

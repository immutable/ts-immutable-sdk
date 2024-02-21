import { WidgetConfiguration } from './widget';
import { SalePaymentTypes } from '../events/sale';

/**
 * Sale Widget Configuration represents the configuration options for the Sale Widget.
 */
export type SaleWidgetConfiguration = {
  /**
   * disabled payment methods, at least one payment type should be enabled
   */
  disabledPaymentTypes?: [SalePaymentTypes];
} & WidgetConfiguration;

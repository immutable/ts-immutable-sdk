/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CreateOrderProtocolData } from './CreateOrderProtocolData';

export type ProtocolData = (CreateOrderProtocolData & {
  /**
   * Operator signature signed by orderbook
   */
  operator_signature: string;
});


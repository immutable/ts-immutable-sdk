/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateOrderProtocolData = {
  /**
   * The Order type
   */
  order_type: CreateOrderProtocolData.order_type;
  /**
   * Immutable zone address
   */
  zone_address: string;
};

export namespace CreateOrderProtocolData {

  /**
   * The Order type
   */
  export enum order_type {
    FULL_OPEN = 'FULL_OPEN',
  }


}


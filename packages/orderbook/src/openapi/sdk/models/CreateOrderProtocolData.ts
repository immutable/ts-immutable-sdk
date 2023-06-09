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
  /**
   * big.Int or uint256 string for order counter
   */
  counter: string;
  /**
   * Immutable Seaport contract address
   */
  seaport_address: string;
  /**
   * Immutable Seaport contract version
   */
  seaport_version: string;
};

export namespace CreateOrderProtocolData {

  /**
   * The Order type
   */
  export enum order_type {
    FULL_RESTRICTED = 'FULL_RESTRICTED',
  }


}


/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ProtocolData = {
  /**
   * Seaport order type
   */
  order_type: ProtocolData.order_type;
  /**
   * big.Int or uint256 string for order counter
   */
  counter: string;
  /**
   * Immutable zone address
   */
  zone_address: string;
  /**
   * Immutable Seaport contract address
   */
  seaport_address: string;
  /**
   * Immutable Seaport contract version
   */
  seaport_version: string;
};

export namespace ProtocolData {

  /**
   * Seaport order type
   */
  export enum order_type {
    FULL_RESTRICTED = 'FULL_RESTRICTED',
    PARTIAL_RESTRICTED = 'PARTIAL_RESTRICTED',
  }


}


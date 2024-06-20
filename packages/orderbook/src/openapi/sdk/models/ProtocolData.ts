/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ProtocolData = {
  /**
   * Seaport order type. Orders containing ERC721 tokens will need to pass in the order type as FULL_RESTRICTED while orders with ERC1155 tokens will need to pass in the order_type as PARTIAL_RESTRICTED
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
   * Seaport order type. Orders containing ERC721 tokens will need to pass in the order type as FULL_RESTRICTED while orders with ERC1155 tokens will need to pass in the order_type as PARTIAL_RESTRICTED
   */
  export enum order_type {
    FULL_RESTRICTED = 'FULL_RESTRICTED',
    PARTIAL_RESTRICTED = 'PARTIAL_RESTRICTED',
  }


}


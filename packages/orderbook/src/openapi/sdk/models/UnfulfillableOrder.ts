/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UnfulfillableOrder = {
  /**
   * OrderID for the requested but unfulfillable order
   */
  order_id: string;
  /**
   * Token ID for the ERC721 or ERC1155 token when fulfilling a collection order
   */
  token_id?: string;
  /**
   * Nullable string containing error reason if the signing is unsuccessful for the order
   */
  reason: string;
};


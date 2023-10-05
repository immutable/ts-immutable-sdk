/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UnfulfillableOrder = {
  /**
   * OrderID for the requested but unfulfillable order
   */
  order_id: string;
  /**
   * Nullable string containing error reason if the signing is unsuccessful for the order
   */
  reason: string;
};


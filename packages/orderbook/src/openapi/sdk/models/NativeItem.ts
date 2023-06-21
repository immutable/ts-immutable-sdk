/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type NativeItem = {
  /**
   * Token type user is offering, which in this case is the native IMX token
   */
  item_type: 'NATIVE';
  /**
   * A string representing the starting price at which the user is willing to sell the token. This value is provided in the smallest unit of the token (e.g., wei for Ethereum).
   */
  start_amount: string;
};


/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Fee = {
  /**
   * Fee payable to recipient upon settlement
   */
  amount: string;
  /**
   * Fee type
   */
  type: Fee.type;
  /**
   * Wallet address of fee recipient
   */
  recipient_address: string;
};

export namespace Fee {

  /**
   * Fee type
   */
  export enum type {
    ROYALTY = 'ROYALTY',
    MAKER_ECOSYSTEM = 'MAKER_ECOSYSTEM',
    TAKER_ECOSYSTEM = 'TAKER_ECOSYSTEM',
    PROTOCOL = 'PROTOCOL',
  }


}


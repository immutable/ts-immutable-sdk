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
  fee_type: Fee.fee_type;
  /**
   * Wallet address of fee recipient
   */
  recipient: string;
};

export namespace Fee {

  /**
   * Fee type
   */
  export enum fee_type {
    ROYALTY = 'ROYALTY',
  }


}


/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type BuyItem = {
  /**
   * Token type user is willing to accept upon settlement
   */
  item_type: BuyItem.item_type;
  /**
   * Starting price of what the user will consider to sell token
   */
  start_amount: string;
  /**
   * Address of ERC20 token
   */
  contract_address?: string;
};

export namespace BuyItem {

  /**
   * Token type user is willing to accept upon settlement
   */
  export enum item_type {
    ERC20 = 'ERC20',
    IMX = 'IMX',
  }


}


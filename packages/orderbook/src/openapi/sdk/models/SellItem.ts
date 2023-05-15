/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SellItem = {
  /**
   * Token type user is offering which in this case is a ERC721
   */
  item_type: SellItem.item_type;
  /**
   * Address of ERC721 token
   */
  contract_address: string;
  /**
   * ID of ERC721 token
   */
  token_id: string;
};

export namespace SellItem {

  /**
   * Token type user is offering which in this case is a ERC721
   */
  export enum item_type {
    ERC721 = 'ERC721',
  }


}


/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ERC1155CollectionItem = {
  /**
   * Token type user is offering, which in this case is ERC1155
   */
  type: 'ERC1155_COLLECTION';
  /**
   * Address of ERC1155 collection
   */
  contract_address: string;
  /**
   * A string representing the price at which the user is willing to sell the token. This value is provided in the smallest unit of the token (e.g., wei for Ethereum).
   */
  amount: string;
};


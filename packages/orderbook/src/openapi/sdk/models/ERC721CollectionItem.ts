/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ERC721CollectionItem = {
  /**
   * Token type user is offering, which in this case is ERC721
   */
  type: 'ERC721_COLLECTION';
  /**
   * Address of ERC721 collection
   */
  contract_address: string;
  /**
   * A string representing the price at which the user is willing to sell the token. This value is provided in the smallest unit of the token (e.g., wei for Ethereum).
   */
  amount: string;
};


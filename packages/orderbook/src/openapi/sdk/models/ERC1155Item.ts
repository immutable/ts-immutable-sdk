/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ERC1155Item = {
  /**
   * Token type user is offering, which in this case is ERC1155
   */
  type: 'ERC1155';
  /**
   * Address of ERC1155 token
   */
  contract_address: string;
  /**
   * ID of ERC1155 token
   */
  token_id: string;
  /**
   * A string representing the price at which the user is willing to sell the token. This value is provided in the smallest unit of the token (e.g., wei for Ethereum).
   */
  amount: string;
};


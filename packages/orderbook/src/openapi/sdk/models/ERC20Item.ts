/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ERC20Item = {
  /**
   * Token type user is offering, which in this case is ERC20
   */
  type: 'ERC20';
  /**
   * Address of ERC20 token
   */
  contract_address: string;
  /**
   * A string representing the price at which the user is willing to sell the token. This value is provided in the smallest unit of the token (e.g., wei for Ethereum).
   */
  amount: string;
};


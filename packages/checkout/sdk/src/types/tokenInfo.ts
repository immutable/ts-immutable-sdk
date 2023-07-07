/**
 * Represents information about a token.
 * @interface TokenInfo
 * @property {string} name - The name of the token.
 * @property {string} symbol - The symbol of the token.
 * @property {number} decimals - The number of decimal places the token supports.
 * @property {string | undefined} [address] - The address of the token.
 * @property {string | undefined} [icon] - The URL of the token's icon.
 */
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address?: string;
  icon?: string;
}

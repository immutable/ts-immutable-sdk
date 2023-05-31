/**
 * Interface representing token information.
 * @property {string} name - The token name.
 * @property {string} symbol - The token symbol.
 * @property {number} decimals - The token decimals.
 * @property {string} [address] - The token contract address.
 * @property {string} [icon] - The token icon URL/data:image.
 */
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address?: string;
  icon?: string;
}

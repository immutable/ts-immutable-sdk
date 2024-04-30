export enum ERC721TokenType {
  ERC721 = 'ERC721',
}

export interface FeeType {
  recipient: string;
  /**
   * Percentage truncated to 2 d.p.
   * 10.24 = 10.24%
   */
  percentage: number;
}

export enum ETHTokenType {
  ETH = 'ETH',
}

export enum ERC20TokenType {
  ERC20 = 'ERC20',
}

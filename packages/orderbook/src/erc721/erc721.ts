import { ImmutableERC721Base } from 'typechain/types';
import { RoyaltyInfo } from 'types';

export class ERC721 {
  constructor(private readonly erc721: ImmutableERC721Base) {}

  async royaltyInfo(tokenId: string, salePrice: string): Promise<RoyaltyInfo> {
    const [recipient, royaltyRequired] = await this.erc721.royaltyInfo(tokenId, salePrice);
    return { recipient, amountRequired: royaltyRequired.toString() };
  }
}

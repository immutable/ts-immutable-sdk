import { providers } from 'ethers';
import { ImmutableERC721Base__factory, ImmutableERC721Base } from 'typechain/types';
import { RoyaltyInfo } from 'types';

export class ERC721 {
  private erc721: ImmutableERC721Base;

  constructor(contractAddress: string, provider: providers.Provider) {
    this.erc721 = ImmutableERC721Base__factory.connect(contractAddress, provider);
  }

  async royaltyInfo(tokenId: string, salePrice: string): Promise<RoyaltyInfo> {
    const [recipient, royaltyRequired] = await this.erc721.royaltyInfo(tokenId, salePrice);
    return { recipient, amountRequired: royaltyRequired.toString() };
  }
}

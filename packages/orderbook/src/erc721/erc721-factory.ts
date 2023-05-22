import { providers } from 'ethers';
import { ImmutableERC721Base__factory, ImmutableERC721Base } from 'typechain/types';
import { ERC721 } from './erc721';

export class ERC721Factory {
  private erc721: ImmutableERC721Base;

  constructor(contractAddress: string, provider: providers.Provider) {
    this.erc721 = ImmutableERC721Base__factory.connect(contractAddress, provider);
  }

  create(): ERC721 {
    return new ERC721(this.erc721);
  }
}

import { mock, when, instance } from 'ts-mockito';
import { ImmutableERC721Base } from 'typechain/types';
import { BigNumber } from 'ethers';
import { ERC721 } from './erc721';

describe('ERC721', () => {
  describe('RoyaltyInfo', () => {
    it('returns the required royalty recipient and amount as a string', async () => {
      const mockedContract = mock<ImmutableERC721Base>();

      const tokenId = '123';
      const salePrice = '400000';

      when(mockedContract.royaltyInfo(tokenId, salePrice))
        .thenReturn(Promise.resolve(['0x123', BigNumber.from(100)]));

      const royaltyInfo = await new ERC721(instance(mockedContract))
        .royaltyInfo(tokenId, salePrice);

      expect(royaltyInfo.recipient).toEqual('0x123');
      expect(royaltyInfo.amountRequired).toEqual('100');
    });
  });
});

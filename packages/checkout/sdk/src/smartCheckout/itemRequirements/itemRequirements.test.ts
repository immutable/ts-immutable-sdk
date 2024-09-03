import { Web3Provider } from '@ethersproject/providers';
import { utils } from 'ethers';
import { getTokenContract } from '../../instance';
import { getItemRequirementsFromRequirements } from './itemRequirements';
import {
  ERC20ItemRequirement, ERC721ItemRequirement, ItemType, NativeItemRequirement,
} from '../../types';

jest.mock('../../instance');
describe('itemRequirements', () => {
  describe('getItemRequirementsFromParams', () => {
    it('should map each token requirement to an itemRequirement with BigNumber amount', async () => {
      (getTokenContract as jest.Mock).mockReturnValue({ decimals: jest.fn().mockResolvedValue(18) });
      const mockProvider = {} as Web3Provider;
      const erc20ItemRequirements: (NativeItemRequirement | ERC20ItemRequirement | ERC721ItemRequirement)[] = [
        {
          type: ItemType.NATIVE,
          amount: '2.0',
          isFee: true,
        },
        {
          type: ItemType.ERC20,
          spenderAddress: '0xSPENDER',
          amount: '1.5',
          tokenAddress: '0xCONTRACTADDRESS1',
        },
        {
          type: ItemType.ERC20,
          spenderAddress: '0xSPENDER',
          amount: '0.5',
          tokenAddress: '0xCONTRACTADDRESS2',
        },
        {
          type: ItemType.ERC721,
          id: '0',
          spenderAddress: '0xSPENDER',
          contractAddress: '0xCONTRACTADDRESS3',
        },

      ];
      const itemRequirements = await getItemRequirementsFromRequirements(mockProvider, erc20ItemRequirements);

      expect(itemRequirements).toEqual([
        {
          type: ItemType.NATIVE,
          amount: utils.parseUnits('2.0', 18),
          isFee: true,
        },
        {
          type: ItemType.ERC20,
          spenderAddress: '0xSPENDER',
          amount: utils.parseUnits('1.5', 18),
          tokenAddress: '0xCONTRACTADDRESS1',
        },
        {
          type: ItemType.ERC20,
          spenderAddress: '0xSPENDER',
          amount: utils.parseUnits('0.5', 18),
          tokenAddress: '0xCONTRACTADDRESS2',
        },
        {
          type: ItemType.ERC721,
          spenderAddress: '0xSPENDER',
          id: '0',
          contractAddress: '0xCONTRACTADDRESS3',
        },
      ]);
    });
  });
});

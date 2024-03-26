import { BigNumber } from 'ethers';
import { ItemRequirement, ItemType } from '../../types';
import {
  erc20ItemAggregator, erc721ItemAggregator, itemAggregator, nativeAggregator,
} from './itemAggregator';

describe('itemAggregator', () => {
  describe('itemAggregator', () => {
    it('should aggregate items', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const aggregatedItems = itemAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(2),
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(2),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ]);
    });
  });

  describe('erc20ItemAggregator', () => {
    it('should return aggregated erc20 items', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const aggregatedItems = erc20ItemAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(2),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
      ]);
    });

    it('should not aggregate erc20s', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20_1',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20_2',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const aggregatedItems = erc20ItemAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20_1',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20_2',
          spenderAddress: '0xSEAPORT',
        },
      ]);
    });

    it('should return empty array', () => {
      const itemRequirements: ItemRequirement[] = [];

      const aggregatedItems = erc20ItemAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([]);
    });

    it('should return aggregated items when not ordered', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const aggregatedItems = erc20ItemAggregator(itemRequirements);
      expect(aggregatedItems).toEqual(
        expect.arrayContaining([
          {
            type: ItemType.NATIVE,
            amount: BigNumber.from(1),
          },
          {
            type: ItemType.NATIVE,
            amount: BigNumber.from(1),
          },
          {
            type: ItemType.ERC20,
            amount: BigNumber.from(2),
            tokenAddress: '0xERC20',
            spenderAddress: '0xSEAPORT',
          },
        ]),
      );
    });

    it('should not aggregate unknown item types', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: 'ERC1559' as ItemType,
          contractAddress: '0xERC1559',
          spenderAddress: '0xSEAPORT',
        } as ItemRequirement,
        {
          type: 'ERC1559' as ItemType,
          contractAddress: '0xERC1559',
          spenderAddress: '0xSEAPORT',
        } as ItemRequirement,
      ];

      const aggregatedItems = erc20ItemAggregator(itemRequirements);
      expect(aggregatedItems).toEqual(
        expect.arrayContaining([
          {
            type: ItemType.NATIVE,
            amount: BigNumber.from(1),
          },
          {
            type: ItemType.NATIVE,
            amount: BigNumber.from(1),
          },
          {
            type: ItemType.ERC20,
            amount: BigNumber.from(2),
            tokenAddress: '0xERC20',
            spenderAddress: '0xSEAPORT',
          },
          {
            type: 'ERC1559' as ItemType,
            contractAddress: '0xERC1559',
            spenderAddress: '0xSEAPORT',
          } as ItemRequirement,
          {
            type: 'ERC1559' as ItemType,
            contractAddress: '0xERC1559',
            spenderAddress: '0xSEAPORT',
          } as ItemRequirement,
        ]),
      );
    });
  });

  describe('erc721ItemAggregator', () => {
    it('should return aggregated erc721 items', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const aggregatedItems = erc721ItemAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ]);
    });

    it('should not aggregate erc721s', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          id: '2',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const aggregatedItems = erc721ItemAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          id: '2',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ]);
    });

    it('should return empty array', () => {
      const itemRequirements: ItemRequirement[] = [];

      const aggregatedItems = erc721ItemAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([]);
    });

    it('should return aggregated items when not ordered', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const aggregatedItems = erc20ItemAggregator(itemRequirements);
      expect(aggregatedItems).toEqual(
        expect.arrayContaining([
          {
            type: ItemType.NATIVE,
            amount: BigNumber.from(1),
          },
          {
            type: ItemType.NATIVE,
            amount: BigNumber.from(1),
          },
          {
            type: ItemType.ERC721,
            id: '1',
            contractAddress: '0xERC721',
            spenderAddress: '0xSEAPORT',
          },
        ]),
      );
    });

    it('should not aggregate unknown item types', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: 'ERC1559' as ItemType,
          contractAddress: '0xERC1559',
          spenderAddress: '0xSEAPORT',
        } as ItemRequirement,
        {
          type: 'ERC1559' as ItemType,
          contractAddress: '0xERC1559',
          spenderAddress: '0xSEAPORT',
        } as ItemRequirement,
      ];

      const aggregatedItems = erc721ItemAggregator(itemRequirements);
      expect(aggregatedItems).toEqual(
        expect.arrayContaining([
          {
            type: ItemType.NATIVE,
            amount: BigNumber.from(1),
          },
          {
            type: ItemType.NATIVE,
            amount: BigNumber.from(1),
          },
          {
            type: ItemType.ERC721,
            id: '1',
            contractAddress: '0xERC721',
            spenderAddress: '0xSEAPORT',
          },
          {
            type: 'ERC1559' as ItemType,
            contractAddress: '0xERC1559',
            spenderAddress: '0xSEAPORT',
          } as ItemRequirement,
          {
            type: 'ERC1559' as ItemType,
            contractAddress: '0xERC1559',
            spenderAddress: '0xSEAPORT',
          } as ItemRequirement,
        ]),
      );
    });
  });

  describe('nativeAggregator', () => {
    it('should aggregate native items', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const aggregatedItems = nativeAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(2),
        },
      ]);
    });
  });
});

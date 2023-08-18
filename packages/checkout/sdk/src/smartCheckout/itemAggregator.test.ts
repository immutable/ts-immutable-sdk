import { BigNumber } from 'ethers';
import { ItemRequirement, ItemType } from '../types';
import { erc20ItemAggregator, itemAggregator } from './itemAggregator';

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
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const aggregatedItems = itemAggregator(itemRequirements);
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
          contractAddress: '0xERC20',
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
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          contractAddress: '0xERC20',
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
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
      ]);
    });

    it('should return same inputs', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          contractAddress: '0xERC20',
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
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          contractAddress: '0xERC20',
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
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          contractAddress: '0xERC20',
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
            contractAddress: '0xERC20',
            spenderAddress: '0xSEAPORT',
          },
        ]),
      );
    });

    it('should not filter unknown item types', () => {
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
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(1),
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: 'ERC721' as ItemType,
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        } as ItemRequirement,
        {
          type: 'ERC721' as ItemType,
          contractAddress: '0xERC721',
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
            contractAddress: '0xERC20',
            spenderAddress: '0xSEAPORT',
          },
          {
            type: 'ERC721' as ItemType,
            contractAddress: '0xERC721',
            spenderAddress: '0xSEAPORT',
          } as ItemRequirement,
          {
            type: 'ERC721' as ItemType,
            contractAddress: '0xERC721',
            spenderAddress: '0xSEAPORT',
          } as ItemRequirement,
        ]),
      );
    });
  });
});

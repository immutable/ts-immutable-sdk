import { ItemRequirement, ItemType } from '../../types';
import { balanceAggregator, erc20BalanceAggregator, erc721BalanceAggregator } from './balanceAggregator';
import { nativeAggregator } from './itemAggregator';

describe('balanceAggregator', () => {
  describe('balanceAggregator', () => {
    it('should aggregate items', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: true,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const aggregatedItems = balanceAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: true,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(2),
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(2),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
      ]);
    });
  });

  describe('erc20BalanceAggregator', () => {
    it('should return aggregated erc20 items', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(2),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: true,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
      ];

      const aggregatedItems = erc20BalanceAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.NATIVE,
          amount: BigInt(2),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: true,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(2),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
      ]);
    });

    it('should not aggregate erc20 items when one is a fee', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(2),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: true,
        },
      ];

      const aggregatedItems = erc20BalanceAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: true,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(2),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
      ]);
    });

    it('should not aggregate different erc20s', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20_1',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20_2',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
      ];

      const aggregatedItems = erc20BalanceAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20_1',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20_2',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
      ]);
    });

    it('should return empty array', () => {
      const itemRequirements: ItemRequirement[] = [];

      const aggregatedItems = erc20BalanceAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([]);
    });

    it('should return aggregated items when not ordered', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(2),
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: true,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
      ];

      const aggregatedItems = erc20BalanceAggregator(itemRequirements);
      expect(aggregatedItems).toEqual(
        expect.arrayContaining([
          {
            type: ItemType.NATIVE,
            amount: BigInt(2),
            isFee: false,
          },
          {
            type: ItemType.NATIVE,
            amount: BigInt(1),
            isFee: true,
          },
          {
            type: ItemType.ERC20,
            amount: BigInt(2),
            tokenAddress: '0xERC20',
            spenderAddress: '0xSEAPORT',
            isFee: false,
          },
        ]),
      );
    });

    it('should not aggregate unknown item types', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(2),
          isFee: true,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
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

      const aggregatedItems = erc20BalanceAggregator(itemRequirements);
      expect(aggregatedItems).toEqual(
        expect.arrayContaining([
          {
            type: ItemType.NATIVE,
            amount: BigInt(1),
            isFee: false,
          },
          {
            type: ItemType.NATIVE,
            amount: BigInt(2),
            isFee: true,
          },
          {
            type: ItemType.ERC20,
            amount: BigInt(2),
            tokenAddress: '0xERC20',
            spenderAddress: '0xSEAPORT',
            isFee: false,
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

  describe('erc721balanceAggregator', () => {
    it('should return aggregated erc721 items', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: true,
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

      const aggregatedItems = erc721BalanceAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: true,
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
          amount: BigInt(1),
          isFee: false,
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

      const aggregatedItems = erc721BalanceAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
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

      const aggregatedItems = erc721BalanceAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([]);
    });

    it('should return aggregated items when not ordered', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: true,
        },
        {
          type: ItemType.ERC721,
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ];

      const aggregatedItems = erc721BalanceAggregator(itemRequirements);
      expect(aggregatedItems).toEqual(
        expect.arrayContaining([
          {
            type: ItemType.NATIVE,
            amount: BigInt(1),
            isFee: false,
          },
          {
            type: ItemType.NATIVE,
            amount: BigInt(1),
            isFee: true,
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
          amount: BigInt(2),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: true,
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

      const aggregatedItems = erc721BalanceAggregator(itemRequirements);
      expect(aggregatedItems).toEqual(
        expect.arrayContaining([
          {
            type: ItemType.NATIVE,
            amount: BigInt(2),
            isFee: false,
          },
          {
            type: ItemType.NATIVE,
            amount: BigInt(1),
            isFee: true,
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
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
      ];

      const aggregatedItems = nativeAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(2),
          isFee: false,
        },
      ]);
    });

    it('should not aggregate native fee items', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(2),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: true,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
      ];

      const aggregatedItems = nativeAggregator(itemRequirements);
      expect(aggregatedItems).toEqual([
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: true,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(1),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt(2),
          isFee: false,
        },
      ]);
    });
  });
});

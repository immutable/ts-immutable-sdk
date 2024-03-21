import { BigNumber } from 'ethers';
import {
  ERC20Item, ERC721Item, ItemBalance, ItemRequirement, ItemType, NativeItem,
} from '../../types';
import {
  getERC721BalanceRequirement,
  getTokenBalanceRequirement,
  getTokensFromRequirements,
} from './balanceRequirement';
import { NATIVE } from '../../env';

describe('balanceRequirement', () => {
  describe('getTokensFromRequirements', () => {
    it('should get tokens from requirements', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from('1000000000000000000'),
        },
        {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigNumber.from('1000000000000000000'),
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          id: '0',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ];

      expect(getTokensFromRequirements(itemRequirements)).toEqual([
        {
          address: NATIVE,
        },
        {
          address: '0xERC20',
        },
        {
          address: '0xERC721',
        },
      ]);
    });
  });

  describe('getERC721BalanceRequirement', () => {
    it('should return sufficient true if meets requirements for ERC721', () => {
      const itemRequirement: ERC721Item = {
        type: ItemType.ERC721,
        id: '0',
        contractAddress: '0xERC721',
        spenderAddress: '0xSEAPORT',
      };
      const balances: ItemBalance[] = [
        {
          type: ItemType.ERC721,
          balance: BigNumber.from('1'),
          formattedBalance: '1',
          contractAddress: '0xERC721',
          id: '0',
        },
      ];
      const result = getERC721BalanceRequirement(itemRequirement, balances);
      expect(result).toEqual(
        {
          sufficient: true,
          type: ItemType.ERC721,
          delta: {
            balance: BigNumber.from(0),
            formattedBalance: '0',
          },
          required: {
            type: ItemType.ERC721,
            balance: BigNumber.from(1),
            formattedBalance: '1',
            contractAddress: '0xERC721',
            id: '0',
          },
          current: {
            type: ItemType.ERC721,
            balance: BigNumber.from(1),
            formattedBalance: '1',
            contractAddress: '0xERC721',
            id: '0',
          },
        },
      );
    });

    it('should return sufficient false if does not meet requirement for ERC721', () => {
      const itemRequirement: ERC721Item = {
        type: ItemType.ERC721,
        id: '0',
        contractAddress: '0xERC721',
        spenderAddress: '0xSEAPORT',
      };
      const balances: ItemBalance[] = [
        {
          type: ItemType.NATIVE,
          balance: BigNumber.from('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'NATIVE',
            symbol: 'NATIVE',
            decimals: 18,
            address: '0xNATIVE',
          },
        },
      ];
      const result = getERC721BalanceRequirement(itemRequirement, balances);
      expect(result).toEqual(
        {
          sufficient: false,
          type: ItemType.ERC721,
          delta: {
            balance: BigNumber.from(1),
            formattedBalance: '1',
          },
          required: {
            type: ItemType.ERC721,
            balance: BigNumber.from(1),
            formattedBalance: '1',
            contractAddress: '0xERC721',
            id: '0',
          },
          current: {
            type: ItemType.ERC721,
            balance: BigNumber.from(0),
            formattedBalance: '0',
            contractAddress: '0xERC721',
            id: '0',
          },
        },
      );
    });
  });

  describe('getTokenBalanceRequirement', () => {
    it('should return sufficient true if meets requirements for NATIVE', async () => {
      const itemRequirement: NativeItem = {
        type: ItemType.NATIVE,
        amount: BigNumber.from('1000000000000000000'),
      };
      const balances: ItemBalance[] = [
        {
          type: ItemType.NATIVE,
          balance: BigNumber.from('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      ];

      const result = await getTokenBalanceRequirement(itemRequirement, balances);
      expect(result).toEqual({
        sufficient: true,
        type: ItemType.NATIVE,
        delta: {
          balance: BigNumber.from(0),
          formattedBalance: '0.0',
        },
        required: {
          type: ItemType.NATIVE,
          balance: BigNumber.from('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
        current: {
          type: ItemType.NATIVE,
          balance: BigNumber.from('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      });
    });

    it('should return sufficient true if meets requirements for ERC20', () => {
      const itemRequirement: ERC20Item = {
        type: ItemType.ERC20,
        tokenAddress: '0xERC20',
        amount: BigNumber.from('1000000000000000000'),
        spenderAddress: '0xSEAPORT',
      };
      const balances: ItemBalance[] = [
        {
          type: ItemType.ERC20,
          balance: BigNumber.from('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
        },
      ];

      const result = getTokenBalanceRequirement(itemRequirement, balances);
      expect(result).toEqual({
        sufficient: true,
        type: ItemType.ERC20,
        delta: {
          balance: BigNumber.from(0),
          formattedBalance: '0.0',
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
        },
      });
    });

    it('should return sufficient false if requirements not met for NATIVE', () => {
      const itemRequirement: NativeItem = {
        type: ItemType.NATIVE,
        amount: BigNumber.from('1000000000000000000'),
      };
      const balances: ItemBalance[] = [
        {
          type: ItemType.NATIVE,
          balance: BigNumber.from('10000000000'),
          formattedBalance: '0.000001',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
        {
          type: ItemType.ERC20,
          balance: BigNumber.from('100000'),
          formattedBalance: '0.000000001',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
        },
      ];

      const result = getTokenBalanceRequirement(itemRequirement, balances);
      expect(result).toEqual({
        sufficient: false,
        type: ItemType.NATIVE,
        delta: {
          balance: BigNumber.from('999999990000000000'),
          formattedBalance: '0.99999999',
        },
        required: {
          type: ItemType.NATIVE,
          balance: BigNumber.from('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
        current: {
          type: ItemType.NATIVE,
          balance: BigNumber.from('10000000000'),
          formattedBalance: '0.000001',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      });
    });

    it('should return sufficient false if requirements not met for ERC20', () => {
      const itemRequirement: ERC20Item = {
        type: ItemType.ERC20,
        tokenAddress: '0xERC20',
        amount: BigNumber.from('1000000000000000000'),
        spenderAddress: '0xSEAPORT',
      };
      const balances: ItemBalance[] = [
        {
          type: ItemType.NATIVE,
          balance: BigNumber.from('100000'),
          formattedBalance: '0.000000001',
          token: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        },
        {
          type: ItemType.ERC20,
          balance: BigNumber.from('10000000000'),
          formattedBalance: '0.000001',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
        },
      ];

      const result = getTokenBalanceRequirement(itemRequirement, balances);
      expect(result).toEqual({
        sufficient: false,
        type: ItemType.ERC20,
        delta: {
          balance: BigNumber.from('999999990000000000'),
          formattedBalance: '0.99999999',
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from('10000000000'),
          formattedBalance: '0.000001',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
        },
      });
    });
  });
});

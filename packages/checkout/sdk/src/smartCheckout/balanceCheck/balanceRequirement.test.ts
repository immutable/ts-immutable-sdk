import { Contract } from 'ethers';
import {
  ChainId,
  ERC20Item,
  ERC721Item,
  ItemBalance,
  ItemRequirement,
  ItemType,
  NamedBrowserProvider,
  NativeItem,
  TokenInfo,
} from '../../types';
import {
  getERC721BalanceRequirement,
  getTokenBalanceRequirement,
  getTokensFromRequirements,
  getTokensInfo,
} from './balanceRequirement';
import { NATIVE, ZKEVM_NATIVE_TOKEN } from '../../env';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn(),
}));

describe('balanceRequirement', () => {
  describe('getTokensFromRequirements', () => {
    it('should get tokens from requirements', () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt('1000000000000000000'),
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigInt('1000000000000000000'),
          spenderAddress: '0xSEAPORT',
          isFee: false,
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
          balance: BigInt('1'),
          formattedBalance: '1',
          contractAddress: '0xERC721',
          id: '0',
        },
      ];
      const result = getERC721BalanceRequirement(itemRequirement, balances);
      expect(result).toEqual({
        sufficient: true,
        type: ItemType.ERC721,
        delta: {
          balance: BigInt(0),
          formattedBalance: '0',
        },
        required: {
          type: ItemType.ERC721,
          balance: BigInt(1),
          formattedBalance: '1',
          contractAddress: '0xERC721',
          id: '0',
        },
        current: {
          type: ItemType.ERC721,
          balance: BigInt(1),
          formattedBalance: '1',
          contractAddress: '0xERC721',
          id: '0',
        },
        isFee: false,
      });
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
          balance: BigInt('1000000000000000000'),
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
      expect(result).toEqual({
        sufficient: false,
        type: ItemType.ERC721,
        delta: {
          balance: BigInt(1),
          formattedBalance: '1',
        },
        required: {
          type: ItemType.ERC721,
          balance: BigInt(1),
          formattedBalance: '1',
          contractAddress: '0xERC721',
          id: '0',
        },
        current: {
          type: ItemType.ERC721,
          balance: BigInt(0),
          formattedBalance: '0',
          contractAddress: '0xERC721',
          id: '0',
        },
        isFee: false,
      });
    });
  });

  describe('getTokensInfo', () => {
    let mockProvider: NamedBrowserProvider;

    beforeEach(() => {
      jest.resetAllMocks();

      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
        getNetwork: jest.fn().mockResolvedValue({
          chainId: ChainId.ETHEREUM,
        }),
      } as unknown as NamedBrowserProvider;
    });

    it('should return native token data if type is native', async () => {
      const itemRequirements: NativeItem[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt('1000000000000000000'),
          isFee: true,
        },
      ];
      const balances: ItemBalance[] = [
        {
          type: ItemType.NATIVE,
          balance: BigInt('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      ];

      const tokensInfo = await getTokensInfo(itemRequirements, balances, mockProvider);

      expect(tokensInfo).toHaveProperty(NATIVE, ZKEVM_NATIVE_TOKEN);
    });

    it('should fetch ERC20 details from balance when available', async () => {
      const itemRequirements: ERC20Item[] = [
        {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigInt('1000000000000000000'),
          spenderAddress: '0xSEAPORT',
          isFee: true,
        },
      ];
      const balances: ItemBalance[] = [
        {
          type: ItemType.ERC20,
          balance: BigInt('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
        },
      ];

      const tokensInfo = await getTokensInfo(itemRequirements, balances, mockProvider);

      expect(tokensInfo).toHaveProperty('0xerc20', {
        name: 'ERC20',
        symbol: 'ERC20',
        decimals: 18,
        address: '0xERC20',
      });
    });

    it('should fetch ERC20 details from contract when not available in balance', async () => {
      const itemRequirements: ERC20Item[] = [
        {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigInt('1000000000000000000'),
          spenderAddress: '0xSEAPORT',
          isFee: true,
        },
      ];
      const balances: ItemBalance[] = [];

      (Contract as unknown as jest.Mock).mockImplementation(() => ({
        symbol: jest.fn().mockResolvedValue('ERC20'),
        name: jest.fn().mockResolvedValue('ERC20'),
        decimals: jest.fn().mockResolvedValue(18),
      }));

      const tokensInfo = await getTokensInfo(itemRequirements, balances, mockProvider);

      expect(tokensInfo).toHaveProperty('0xerc20', {
        name: 'ERC20',
        symbol: 'ERC20',
        decimals: 18,
        address: '0xERC20',
      });
    });
  });

  describe('getTokenBalanceRequirement', () => {
    it('should return sufficient true if meets requirements for NATIVE', () => {
      const itemRequirement: NativeItem = {
        type: ItemType.NATIVE,
        amount: BigInt('1000000000000000000'),
        isFee: true,
      };
      const balances: ItemBalance[] = [
        {
          type: ItemType.NATIVE,
          balance: BigInt('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      ];
      const tokenInfo: TokenInfo = ZKEVM_NATIVE_TOKEN;

      const result = getTokenBalanceRequirement(
        itemRequirement,
        balances,
        tokenInfo,
      );
      expect(result).toEqual({
        sufficient: true,
        type: ItemType.NATIVE,
        delta: {
          balance: BigInt(0),
          formattedBalance: '0.0',
        },
        required: {
          type: ItemType.NATIVE,
          balance: BigInt('1000000000000000000'),
          formattedBalance: '1.0',
          token: tokenInfo,
        },
        current: {
          type: ItemType.NATIVE,
          balance: BigInt('1000000000000000000'),
          formattedBalance: '1.0',
          token: tokenInfo,
        },
        isFee: true,
      });
    });

    it('should return sufficient true if meets requirements for ERC20', () => {
      const itemRequirement: ERC20Item = {
        type: ItemType.ERC20,
        tokenAddress: '0xERC20',
        amount: BigInt('1000000000000000000'),
        spenderAddress: '0xSEAPORT',
        isFee: true,
      };
      const balances: ItemBalance[] = [
        {
          type: ItemType.ERC20,
          balance: BigInt('1000000000000000000'),
          formattedBalance: '1.0',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
        },
      ];
      const tokenInfo: TokenInfo = {
        name: 'ERC20',
        symbol: 'ERC20',
        decimals: 18,
        address: '0xERC20',
      };

      const result = getTokenBalanceRequirement(
        itemRequirement,
        balances,
        tokenInfo,
      );
      expect(result).toEqual({
        sufficient: true,
        type: ItemType.ERC20,
        delta: {
          balance: BigInt(0),
          formattedBalance: '0.0',
        },
        required: {
          type: ItemType.ERC20,
          balance: BigInt('1000000000000000000'),
          formattedBalance: '1.0',
          token: tokenInfo,
        },
        current: {
          type: ItemType.ERC20,
          balance: BigInt('1000000000000000000'),
          formattedBalance: '1.0',
          token: tokenInfo,
        },
        isFee: true,
      });
    });

    it('should return sufficient false if requirements not met for NATIVE', () => {
      const itemRequirement: NativeItem = {
        type: ItemType.NATIVE,
        amount: BigInt('1000000000000000000'),
        isFee: false,
      };
      const balances: ItemBalance[] = [
        {
          type: ItemType.NATIVE,
          balance: BigInt('10000000000'),
          formattedBalance: '0.000001',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
        {
          type: ItemType.ERC20,
          balance: BigInt('100000'),
          formattedBalance: '0.000000001',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
        },
      ];

      const tokenInfo: TokenInfo = ZKEVM_NATIVE_TOKEN;

      const result = getTokenBalanceRequirement(
        itemRequirement,
        balances,
        tokenInfo,
      );
      expect(result).toEqual({
        sufficient: false,
        type: ItemType.NATIVE,
        delta: {
          balance: BigInt('999999990000000000'),
          formattedBalance: '0.99999999',
        },
        required: {
          type: ItemType.NATIVE,
          balance: BigInt('1000000000000000000'),
          formattedBalance: '1.0',
          token: tokenInfo,
        },
        current: {
          type: ItemType.NATIVE,
          balance: BigInt('10000000000'),
          formattedBalance: '0.000001',
          token: tokenInfo,
        },
        isFee: false,
      });
    });

    it('should return sufficient false if requirements not met for ERC20', () => {
      const itemRequirement: ERC20Item = {
        type: ItemType.ERC20,
        tokenAddress: '0xERC20',
        amount: BigInt('1000000000000000000'),
        spenderAddress: '0xSEAPORT',
        isFee: false,
      };
      const balances: ItemBalance[] = [
        {
          type: ItemType.NATIVE,
          balance: BigInt('100000'),
          formattedBalance: '0.000000001',
          token: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        },
        {
          type: ItemType.ERC20,
          balance: BigInt('10000000000'),
          formattedBalance: '0.000001',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
        },
      ];
      const tokenInfo: TokenInfo = {
        name: 'ERC20',
        symbol: 'ERC20',
        decimals: 18,
        address: '0xERC20',
      };

      const result = getTokenBalanceRequirement(
        itemRequirement,
        balances,
        tokenInfo,
      );
      expect(result).toEqual({
        sufficient: false,
        type: ItemType.ERC20,
        delta: {
          balance: BigInt('999999990000000000'),
          formattedBalance: '0.99999999',
        },
        required: {
          type: ItemType.ERC20,
          balance: BigInt('1000000000000000000'),
          formattedBalance: '1.0',
          token: tokenInfo,
        },
        current: {
          type: ItemType.ERC20,
          balance: BigInt('10000000000'),
          formattedBalance: '0.000001',
          token: tokenInfo,
        },
        isFee: false,
      });
    });
  });
});

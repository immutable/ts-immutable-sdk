import { BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { getSmartCheckoutResult, smartCheckout } from './smartCheckout';
import {
  GasAmount, GasTokenType, ItemRequirement, ItemType, TransactionOrGasType,
} from '../types';
import { hasERC20Allowances, hasERC721Allowances } from './allowance';
import { gasCalculator } from './gas';
import { BalanceCheckResult } from './balanceCheck/types';
import { CheckoutConfiguration } from '../config';
import { balanceCheck } from './balanceCheck';

jest.mock('./allowance');
jest.mock('./gas');
jest.mock('./balanceCheck');

describe('smartCheckout', () => {
  let mockProvider: Web3Provider;

  beforeEach(() => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
      }),
    } as unknown as Web3Provider;
  });

  describe('smartCheckout', () => {
    it('should return sufficient true with item requirements', async () => {
      (hasERC20Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC721Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (gasCalculator as jest.Mock).mockResolvedValue({
        type: ItemType.NATIVE,
        amount: BigNumber.from(1),
      });

      (balanceCheck as jest.Mock).mockResolvedValue({
        sufficient: true,
        balanceRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: true,
            required: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: true,
            required: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: true,
            required: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
        ],
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
      ];

      const transactionOrGasAmount: GasAmount = {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigNumber.from(1),
        },
      };

      const result = await smartCheckout(
        {} as CheckoutConfiguration,
        mockProvider,
        itemRequirements,
        transactionOrGasAmount,
      );

      expect(result).toEqual({
        sufficient: true,
        transactionRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: true,
            required: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: true,
            required: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: true,
            required: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
        ],
      });
    });

    it('should return sufficient false with item requirements', async () => {
      (hasERC20Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC721Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (gasCalculator as jest.Mock).mockResolvedValue({
        type: ItemType.NATIVE,
        amount: BigNumber.from(1),
      });

      (balanceCheck as jest.Mock).mockResolvedValue({
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: false,
            required: {
              balance: BigNumber.from(2),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: false,
            required: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigNumber.from(0),
              formattedBalance: '0.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
        ],
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
      ];

      const transactionOrGasAmount: GasAmount = {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigNumber.from(1),
        },
      };

      const result = await smartCheckout(
        {} as CheckoutConfiguration,
        mockProvider,
        itemRequirements,
        transactionOrGasAmount,
      );

      expect(result).toEqual({
        sufficient: false,
        transactionRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: false,
            required: {
              balance: BigNumber.from(2),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: false,
            required: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigNumber.from(0),
              formattedBalance: '0.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
        ],
      });
    });
  });

  describe('getSmartCheckoutResult', () => {
    it('should return sufficient true with item requirements', () => {
      const balanceCheckResult: BalanceCheckResult = {
        sufficient: true,
        balanceRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: true,
            required: {
              type: ItemType.NATIVE,
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              type: ItemType.NATIVE,
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: true,
            required: {
              type: ItemType.ERC20,
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              type: ItemType.ERC20,
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: true,
            required: {
              type: ItemType.ERC721,
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              type: ItemType.ERC721,
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
        ],
      };
      const result = getSmartCheckoutResult(balanceCheckResult);
      expect(result.sufficient).toBe(true);
      expect(result.transactionRequirements).toEqual([
        {
          type: ItemType.NATIVE,
          sufficient: true,
          required: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0x1010',
            },
          },
          current: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0x1010',
            },
          },
          delta: {
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
          },
        },
        {
          type: ItemType.ERC20,
          sufficient: true,
          required: {
            type: ItemType.ERC20,
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
            token: {
              name: 'zkTKN',
              symbol: 'zkTKN',
              decimals: 18,
              address: '0xERC20',
            },
          },
          current: {
            type: ItemType.ERC20,
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
            token: {
              name: 'zkTKN',
              symbol: 'zkTKN',
              decimals: 18,
              address: '0xERC20',
            },
          },
          delta: {
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
          },
        },
        {
          type: ItemType.ERC721,
          sufficient: true,
          required: {
            type: ItemType.ERC721,
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
            id: '0',
            contractAddress: '0xCollection',
          },
          current: {
            type: ItemType.ERC721,
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
            id: '0',
            contractAddress: '0xCollection',
          },
          delta: {
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
          },
        },
      ]);
    });

    it('should return sufficient false if balanceCheckResult is not sufficient', () => {
      const balanceCheckResult: BalanceCheckResult = {
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: false,
            required: {
              type: ItemType.NATIVE,
              balance: BigNumber.from(2),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              type: ItemType.NATIVE,
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigNumber.from(2),
              formattedBalance: '2.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              type: ItemType.ERC20,
              balance: BigNumber.from(2),
              formattedBalance: '2.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              type: ItemType.ERC20,
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: false,
            required: {
              type: ItemType.ERC721,
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              type: ItemType.ERC721,
              balance: BigNumber.from(0),
              formattedBalance: '0.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
        ],
      };
      const result = getSmartCheckoutResult(balanceCheckResult);
      expect(result.sufficient).toBe(false);
      expect(result.transactionRequirements).toEqual([
        {
          type: ItemType.NATIVE,
          sufficient: false,
          required: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(2),
            formattedBalance: '2.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0x1010',
            },
          },
          current: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0x1010',
            },
          },
          delta: {
            balance: BigNumber.from(2),
            formattedBalance: '2.0',
          },
        },
        {
          type: ItemType.ERC20,
          sufficient: false,
          required: {
            type: ItemType.ERC20,
            balance: BigNumber.from(2),
            formattedBalance: '2.0',
            token: {
              name: 'zkTKN',
              symbol: 'zkTKN',
              decimals: 18,
              address: '0xERC20',
            },
          },
          current: {
            type: ItemType.ERC20,
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
            token: {

              name: 'zkTKN',
              symbol: 'zkTKN',

              decimals: 18,
              address: '0xERC20',
            },
          },
          delta: {
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
          },
        },
        {
          type: ItemType.ERC721,
          sufficient: false,
          required: {
            type: ItemType.ERC721,
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
            id: '0',
            contractAddress: '0xCollection',
          },
          current: {
            type: ItemType.ERC721,
            balance: BigNumber.from(0),
            formattedBalance: '0.0',
            id: '0',
            contractAddress: '0xCollection',
          },
          delta: {
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
          },
        },
      ]);
    });

    it('should return sufficient false if any item in the requirements is false', () => {
      const balanceCheckResult: BalanceCheckResult = {
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: true,
            required: {
              type: ItemType.NATIVE,
              balance: BigNumber.from(2),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              type: ItemType.NATIVE,
              balance: BigNumber.from(2),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigNumber.from(2),
              formattedBalance: '2.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              type: ItemType.ERC20,
              balance: BigNumber.from(2),
              formattedBalance: '2.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              type: ItemType.ERC20,
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1.0',
            },
          },
        ],
      };
      const result = getSmartCheckoutResult(balanceCheckResult);
      expect(result.sufficient).toBe(false);
      expect(result.transactionRequirements).toEqual([
        {
          type: ItemType.NATIVE,
          sufficient: true,
          required: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(2),
            formattedBalance: '2.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0x1010',
            },
          },
          current: {
            type: ItemType.NATIVE,
            balance: BigNumber.from(2),
            formattedBalance: '2.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0x1010',
            },
          },
          delta: {
            balance: BigNumber.from(2),
            formattedBalance: '2.0',
          },
        },
        {
          type: ItemType.ERC20,
          sufficient: false,
          required: {
            type: ItemType.ERC20,
            balance: BigNumber.from(2),
            formattedBalance: '2.0',
            token: {
              name: 'zkTKN',
              symbol: 'zkTKN',
              decimals: 18,
              address: '0xERC20',
            },
          },
          current: {
            type: ItemType.ERC20,
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
            token: {
              name: 'zkTKN',
              symbol: 'zkTKN',
              decimals: 18,
              address: '0xERC20',
            },
          },
          delta: {
            balance: BigNumber.from(1),
            formattedBalance: '1.0',
          },
        },
      ]);
    });
  });
});

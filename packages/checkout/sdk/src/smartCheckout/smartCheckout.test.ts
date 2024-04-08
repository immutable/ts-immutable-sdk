import { BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { smartCheckout } from './smartCheckout';
import {
  GasAmount,
  GasTokenType,
  ItemRequirement,
  ItemType,
  RoutingOutcomeType,
  TransactionOrGasType,
} from '../types';
import { hasERC20Allowances, hasERC721Allowances } from './allowance';
import { gasCalculator } from './gas';
import { CheckoutConfiguration } from '../config';
import { balanceCheck } from './balanceCheck';
import { routingCalculator } from './routing/routingCalculator';

jest.mock('./allowance');
jest.mock('./gas');
jest.mock('./balanceCheck');
jest.mock('./routing/routingCalculator');

describe('smartCheckout', () => {
  let mockProvider: Web3Provider;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'info').mockImplementation(() => {});
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
      }),
    } as unknown as Web3Provider;

    (routingCalculator as jest.Mock).mockResolvedValue({
      type: RoutingOutcomeType.NO_ROUTES_FOUND,
      message: 'No routes found',
    });
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
        router: {
          availableRoutingOptions: {
            onRamp: undefined,
            swap: undefined,
            bridge: undefined,
          },
          routingOutcome: {
            type: RoutingOutcomeType.NO_ROUTES_FOUND,
            message: 'No routes found',
          },
        },
      });
    });

    it('should return passport as true', async () => {
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

      const passportMockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      const result = await smartCheckout(
        {} as CheckoutConfiguration,
        passportMockProvider,
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
        router: {
          availableRoutingOptions: {
            onRamp: undefined,
            swap: undefined,
            bridge: undefined,
          },
          routingOutcome: {
            type: RoutingOutcomeType.NO_ROUTES_FOUND,
            message: 'No routes found',
          },
        },
      });
    });

    it('should not call gasCalculator if transactionOrGasAmount is not provided', async () => {
      (hasERC20Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC721Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
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

      await smartCheckout(
        {} as CheckoutConfiguration,
        mockProvider,
        itemRequirements,
        undefined,
      );

      expect(gasCalculator).toHaveBeenCalledTimes(0);
    });
  });
});

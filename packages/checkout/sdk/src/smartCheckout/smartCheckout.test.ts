import { overrideBalanceCheckResult, smartCheckout } from './smartCheckout';
import {
  GasAmount,
  GasTokenType,
  ItemRequirement,
  ItemType,
  RoutingOutcomeType,
  TransactionOrGasType,
} from '../types';
import { hasERC20Allowances, hasERC721Allowances, hasERC1155Allowances } from './allowance';
import { gasCalculator } from './gas';
import { CheckoutConfiguration } from '../config';
import { balanceCheck } from './balanceCheck';
import { routingCalculator } from './routing/routingCalculator';
import { getAvailableRoutingOptions } from './routing';
import { BalanceCheckResult } from './balanceCheck/types';
import { BrowserProvider } from 'ethers';

jest.mock('./routing');
jest.mock('./allowance');
jest.mock('./gas');
jest.mock('./balanceCheck');
jest.mock('./routing/routingCalculator');

describe('smartCheckout', () => {
  let mockProvider: BrowserProvider;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'info').mockImplementation(() => {});
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
      }),
    } as unknown as BrowserProvider;

    (routingCalculator as jest.Mock).mockResolvedValue({
      type: RoutingOutcomeType.NO_ROUTES_FOUND,
      message: 'No routes found',
    });

    (getAvailableRoutingOptions as jest.Mock).mockResolvedValue({
      onRamp: true,
      swap: true,
      bridge: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('smartCheckout', () => {
    it('should return sufficient true with item requirements - ERC721 item', async () => {
      (hasERC20Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC721Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC1155Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (gasCalculator as jest.Mock).mockResolvedValue({
        type: ItemType.NATIVE,
        amount: BigInt(1),
      });

      (balanceCheck as jest.Mock).mockResolvedValue({
        sufficient: true,
        balanceRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: true,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: true,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: true,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
        ],
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
      ];

      const transactionOrGasAmount: GasAmount = {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigInt(1),
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
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: true,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: true,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
        ],
      });
    });

    it('should return sufficient true with item requirements - ERC1155 item', async () => {
      (hasERC20Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC721Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC1155Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (gasCalculator as jest.Mock).mockResolvedValue({
        type: ItemType.NATIVE,
        amount: BigInt(1),
      });

      (balanceCheck as jest.Mock).mockResolvedValue({
        sufficient: true,
        balanceRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: true,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigInt(0),
              formattedBalance: '0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: true,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(0),
              formattedBalance: '0',
            },
          },
          {
            type: ItemType.ERC1155,
            sufficient: true,
            required: {
              balance: BigInt(10),
              formattedBalance: '10.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigInt(10),
              formattedBalance: '10.0',
            },
            delta: {
              balance: BigInt(0),
              formattedBalance: '0',
            },
          },
        ],
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
      ];

      const transactionOrGasAmount: GasAmount = {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigInt(1),
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
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigInt(0),
              formattedBalance: '0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: true,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(0),
              formattedBalance: '0',
            },
          },
          {
            type: ItemType.ERC1155,
            sufficient: true,
            required: {
              balance: BigInt(10),
              formattedBalance: '10.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigInt(10),
              formattedBalance: '10.0',
            },
            delta: {
              balance: BigInt(0),
              formattedBalance: '0',
            },
          },
        ],
      });
    });

    it('should invoke onComplete callback once funding routes are returned', (done) => {
      (hasERC20Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC721Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC1155Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (gasCalculator as jest.Mock).mockResolvedValue({
        type: ItemType.NATIVE,
        amount: BigInt(1),
      });

      (balanceCheck as jest.Mock).mockResolvedValue({
        sufficient: true,
        balanceRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: true,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: true,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: true,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
        ],
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
      ];

      const transactionOrGasAmount: GasAmount = {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigInt(1),
        },
      };

      const mockOnComplete = jest.fn().mockImplementation((result) => {
        expect(result).toMatchObject({
          sufficient: true,
          transactionRequirements: [
            {
              type: ItemType.NATIVE,
              sufficient: true,
              required: {
                balance: BigInt(1),
                formattedBalance: '1.0',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                  address: '0x1010',
                },
              },
              current: {
                balance: BigInt(1),
                formattedBalance: '1.0',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                  address: '0x1010',
                },
              },
              delta: {
                balance: BigInt(1),
                formattedBalance: '1.0',
              },
            },
            {
              type: ItemType.ERC20,
              sufficient: true,
              required: {
                balance: BigInt(1),
                formattedBalance: '1.0',
                token: {
                  name: 'zkTKN',
                  symbol: 'zkTKN',
                  decimals: 18,
                  address: '0xERC20',
                },
              },
              current: {
                balance: BigInt(1),
                formattedBalance: '1.0',
                token: {
                  name: 'zkTKN',
                  symbol: 'zkTKN',
                  decimals: 18,
                  address: '0xERC20',
                },
              },
              delta: {
                balance: BigInt(1),
                formattedBalance: '1.0',
              },
            },
            {
              type: ItemType.ERC721,
              sufficient: true,
              required: {
                balance: BigInt(1),
                formattedBalance: '1.0',
                id: '0',
                contractAddress: '0xCollection',
              },
              current: {
                balance: BigInt(1),
                formattedBalance: '1.0',
              },
              delta: {
                balance: BigInt(1),
                formattedBalance: '1.0',
              },
            },
          ],
        });
        done();
      });

      smartCheckout(
        {} as CheckoutConfiguration,
        mockProvider,
        itemRequirements,
        transactionOrGasAmount,
        undefined,
        mockOnComplete,
      );
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

      (hasERC1155Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (gasCalculator as jest.Mock).mockResolvedValue({
        type: ItemType.NATIVE,
        amount: BigInt(1),
      });

      (balanceCheck as jest.Mock).mockResolvedValue({
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: false,
            required: {
              balance: BigInt(2),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: false,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigInt(0),
              formattedBalance: '0.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
        ],
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
      ];

      const transactionOrGasAmount: GasAmount = {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigInt(1),
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
              balance: BigInt(2),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: false,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigInt(0),
              formattedBalance: '0.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
        ],
        router: {
          availableRoutingOptions: {
            onRamp: true,
            swap: true,
            bridge: true,
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

      (hasERC1155Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (gasCalculator as jest.Mock).mockResolvedValue({
        type: ItemType.NATIVE,
        amount: BigInt(1),
      });

      (balanceCheck as jest.Mock).mockResolvedValue({
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: false,
            required: {
              balance: BigInt(2),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: false,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigInt(0),
              formattedBalance: '0.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
        ],
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
      ];

      const transactionOrGasAmount: GasAmount = {
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigInt(1),
        },
      };

      const passportMockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as BrowserProvider;

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
              balance: BigInt(2),
              formattedBalance: '2.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0x1010',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
          {
            type: ItemType.ERC721,
            sufficient: false,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            current: {
              balance: BigInt(0),
              formattedBalance: '0.0',
              id: '0',
              contractAddress: '0xCollection',
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
        ],
        router: {
          availableRoutingOptions: {
            onRamp: true,
            swap: true,
            bridge: true,
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

      (hasERC1155Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (balanceCheck as jest.Mock).mockResolvedValue({
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
        ],
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigInt(1),
          spenderAddress: '0x1',
          isFee: false,
        },
      ];

      const result = await smartCheckout(
        {} as CheckoutConfiguration,
        mockProvider,
        itemRequirements,
        undefined,
      );

      expect(gasCalculator).toHaveBeenCalledTimes(0);

      expect(result).toEqual({
        sufficient: false,
        transactionRequirements: [
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
        ],
        router: {
          availableRoutingOptions: {
            onRamp: true,
            swap: true,
            bridge: true,
          },
          routingOutcome: {
            type: RoutingOutcomeType.NO_ROUTES_FOUND,
            message: 'No routes found',
          },
        },
      });
    });

    it('should return swap funding route when available', async () => {
      (routingCalculator as jest.Mock).mockResolvedValue({
        type: RoutingOutcomeType.NO_ROUTES_FOUND,
        message:
          'Smart Checkout did not find any funding routes to fulfill the transaction',
      });

      (hasERC20Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC721Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC1155Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (balanceCheck as jest.Mock).mockResolvedValue({
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
        ],
      });

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigInt(1),
          spenderAddress: '0x1',
          isFee: false,
        },
      ];

      const result = await smartCheckout(
        {} as CheckoutConfiguration,
        mockProvider,
        itemRequirements,
        undefined,
        {
          swap: false,
        },
      );

      expect(result).toEqual({
        sufficient: false,
        transactionRequirements: [
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            current: {
              balance: BigInt(1),
              formattedBalance: '1.0',
              token: {
                name: 'zkTKN',
                symbol: 'zkTKN',
                decimals: 18,
                address: '0xERC20',
              },
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1.0',
            },
          },
        ],
        router: {
          availableRoutingOptions: {
            onRamp: true,
            swap: false,
            bridge: true,
          },
          routingOutcome: {
            type: RoutingOutcomeType.NO_ROUTES_FOUND,
            message:
              'Smart Checkout did not find any funding routes to fulfill the transaction',
          },
        },
      });
    });
  });

  describe('overrideBalanceCheckResult', () => {
    it('should correctly override sufficient flags and deltas for ERC20 items', () => {
      const mockBalanceCheckResult: BalanceCheckResult = {
        sufficient: true,
        balanceRequirements: [
          {
            sufficient: true,
            type: ItemType.NATIVE,
            delta: {
              balance: BigInt(0),
              formattedBalance: '0.0',
            },
            current: {
              balance: BigInt(100),
              formattedBalance: '100.0',
              token: {
                address: 'native',
                decimals: 18,
                name: 'tIMX',
                symbol: 'tIMX',
              },
              type: ItemType.NATIVE,
            },
            required: {
              balance: BigInt(100),
              formattedBalance: '100.0',
              token: {
                address: 'native',
                decimals: 18,
                name: 'tIMX',
                symbol: 'tIMX',
              },
              type: ItemType.NATIVE,
            },
            isFee: false,
          },
          {
            sufficient: true,
            type: ItemType.ERC20,
            delta: {
              balance: BigInt(-50),
              formattedBalance: '-50.0',
            },
            current: {
              type: ItemType.ERC20,
              balance: BigInt(50),
              formattedBalance: '50.0',
              token: {
                address: '0x3b2d8a1931736fc321c24864bceee981b11c3c57',
                name: 'USDC',
                symbol: 'USDC',
                decimals: 6,
              },
            },
            required: {
              type: ItemType.ERC20,
              balance: BigInt(100),
              formattedBalance: '100.0',
              token: {
                address: '0x3b2d8a1931736fc321c24864bceee981b11c3c57',
                name: 'USDC',
                symbol: 'USDC',
                decimals: 6,
              },
            },
            isFee: false,
          },
        ],
      };

      const result = overrideBalanceCheckResult(mockBalanceCheckResult);

      expect(result.sufficient).toBe(false);
      expect(result.balanceRequirements[1].sufficient).toBe(false);
      expect(result.balanceRequirements[1].delta.balance.toString()).toBe(
        '100',
      );
      expect(result.balanceRequirements[1].delta.formattedBalance).toBe(
        '100.0',
      );
      expect(result.balanceRequirements[0].sufficient).toBe(true);
    });

    it('should return correct sufficient status and still calculate funding routes', async () => {
      (hasERC20Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC721Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      (hasERC1155Allowances as jest.Mock).mockResolvedValue({
        sufficient: true,
        allowances: [],
      });

      const mockBalanceCheckResult = {
        sufficient: true,
        balanceRequirements: [
          {
            type: ItemType.ERC20,
            sufficient: true,
            required: {
              balance: BigInt(100),
              formattedBalance: '100.0',
            },
            current: {
              balance: BigInt(90),
              formattedBalance: '90.0',
            },
            delta: {
              balance: BigInt(-10),
              formattedBalance: '-10.0',
            },
          },
        ],
      };

      (balanceCheck as jest.Mock).mockResolvedValue(mockBalanceCheckResult);

      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.ERC20,
          tokenAddress: '0xERC20',
          amount: BigInt(10),
          spenderAddress: '0x1',
          isFee: false,
        },
      ];

      const onCompletePromise = new Promise((resolve) => {
        const mockOnComplete = jest.fn().mockImplementation((result) => {
          resolve(result);
        });
        smartCheckout(
          {} as CheckoutConfiguration,
          mockProvider,
          itemRequirements,
          undefined,
          undefined,
          mockOnComplete,
        );
      });

      const result = await onCompletePromise;

      expect(routingCalculator).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          sufficient: true,
          transactionRequirements: expect.arrayContaining([
            expect.objectContaining({
              type: ItemType.ERC20,
              sufficient: true,
            }),
          ]),
        }),
      );
    });
  });
});

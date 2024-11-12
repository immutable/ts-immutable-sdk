import { Environment } from '@imtbl/config';
import { BrowserProvider, Contract } from 'ethers';
import {
  ItemRequirement,
  ItemType,
} from '../../types';
import { balanceCheck } from './balanceCheck';
import { CheckoutConfiguration } from '../../config';
import { getAllBalances } from '../../balances';
import { BalanceCheckResult } from './types';
import { DEFAULT_TOKEN_DECIMALS, ZKEVM_NATIVE_TOKEN } from '../../env';
import { HttpClient } from '../../api/http';

jest.mock('../../balances');
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Contract: jest.fn(),
}));

describe('balanceCheck', () => {
  let config: CheckoutConfiguration;
  let mockProvider: BrowserProvider;

  beforeEach(() => {
    jest.resetAllMocks();
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
      }),
      network: {
        chainId: 1,
      },
    } as unknown as BrowserProvider;

    const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
    config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    }, mockedHttpClient);
  });

  describe('when NATIVE tokens are required', () => {
    it('should return sufficient if balance is sufficient', async () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(1),
          isFee: false,
        },
      ];
      const getBalancesResult = {
        balances:
          [
            {
              balance: BigInt(1),
              formattedBalance: '1',
              token: {
                name: '',
                symbol: '',
                decimals: 18,
              },
            },
          ],
      };
      (getAllBalances as jest.Mock).mockResolvedValue(getBalancesResult);

      const { sufficient } = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(sufficient).toBeTruthy();
    });

    it('should return delta if balance is not sufficient', async () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt(3),
          isFee: false,
        },
      ];
      const getBalancesResult = {
        balances:
          [
            {
              balance: BigInt(1),
              formattedBalance: '0.000000000000000001',
              token: ZKEVM_NATIVE_TOKEN,
            },
          ],
      };
      (getAllBalances as jest.Mock).mockResolvedValue(getBalancesResult);

      const result = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(result)
        .toEqual({
          balanceRequirements: [
            {
              type: ItemType.NATIVE,
              sufficient: false,
              delta: {
                balance: BigInt(2),
                formattedBalance: '0.000000000000000002',
              },
              current: {
                ...getBalancesResult.balances[0],
                type: ItemType.NATIVE,
                token: ZKEVM_NATIVE_TOKEN,
              },
              required: {
                type: ItemType.NATIVE,
                balance: BigInt(3),
                formattedBalance: '0.000000000000000003',
                token: ZKEVM_NATIVE_TOKEN,
              },
              isFee: false,
            },
          ],
          sufficient: false,
        });
    });
  });

  describe('when ERC20 tokens are required', () => {
    it('should return sufficient if balance is sufficient', async () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.ERC20,
          amount: BigInt(10),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
      ];
      const getBalancesResult = {
        balances:
          [
            {
              balance: BigInt(20),
              formattedBalance: '1',
              token: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
                address: '0xERC20',
              },
            },
          ],
      };
      (getAllBalances as jest.Mock).mockResolvedValue(getBalancesResult);

      const { sufficient } = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(sufficient).toEqual(true);
    });

    it('should return delta if balance is not sufficient', async () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.ERC20,
          amount: BigInt(10),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
      ];
      const getBalancesResult = {
        balances:
          [
            {
              balance: BigInt(5),
              formattedBalance: '1',
              token: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
                address: '0xERC20',
              },
            },
          ],
      };
      (getAllBalances as jest.Mock).mockResolvedValue(getBalancesResult);

      const result = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(result)
        .toEqual({
          balanceRequirements: [
            {
              type: ItemType.ERC20,
              sufficient: false,
              delta: {
                balance: BigInt(5),
                formattedBalance: '0.000000000000000005',
              },
              current: getBalancesResult.balances[0],
              required: {
                balance: BigInt(10),
                formattedBalance: '0.00000000000000001',
                token: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                  address: '0xERC20',
                },
              },
              isFee: false,
            },
          ],
          sufficient: false,
        });
    });
  });

  describe('when ERC721 tokens are required', () => {
    it('should return sufficient if its ownership matches the owner address', async () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.ERC721,
          id: '1234',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ];
      (getAllBalances as jest.Mock).mockResolvedValue({ balances: [] });
      (Contract as unknown as jest.Mock).mockReturnValue({
        ownerOf: jest.fn().mockResolvedValue('0xADDRESS'),
      });

      const { sufficient } = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(sufficient).toBeTruthy();
    });
  });

  describe('when no balances returned', () => {
    it('should aggregate balance requirements', async () => {
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
          type: ItemType.ERC20,
          amount: BigInt(10),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt(10),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
      ];
      const getBalancesResult = { balances: [] };
      (getAllBalances as jest.Mock).mockResolvedValue(getBalancesResult);
      (Contract as unknown as jest.Mock).mockReturnValue({
        ownerOf: jest.fn().mockResolvedValue('0xADDRESS'),
      });

      const { sufficient, balanceRequirements } = await balanceCheck(
        config,
        mockProvider,
        '0xADDRESS',
        itemRequirements,
      ) as BalanceCheckResult;
      expect(sufficient).toBeFalsy();
      expect(balanceRequirements)
        .toEqual(expect.arrayContaining([
          {
            current: {
              type: ItemType.NATIVE,
              balance: BigInt(0),
              formattedBalance: '0',
              token: ZKEVM_NATIVE_TOKEN,
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '0.000000000000000001',
            },
            required: {
              type: ItemType.NATIVE,
              balance: BigInt(1),
              formattedBalance: '0.000000000000000001',
              token: ZKEVM_NATIVE_TOKEN,
            },
            sufficient: false,
            type: ItemType.NATIVE,
            isFee: false,
          },
          {
            current: {
              type: ItemType.NATIVE,
              balance: BigInt(0),
              formattedBalance: '0',
              token: ZKEVM_NATIVE_TOKEN,
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '0.000000000000000001',
            },
            required: {
              type: ItemType.NATIVE,
              balance: BigInt(1),
              formattedBalance: '0.000000000000000001',
              token: ZKEVM_NATIVE_TOKEN,
            },
            sufficient: false,
            type: ItemType.NATIVE,
            isFee: true,
          },
          {
            delta: {
              balance: BigInt(20),
              formattedBalance: '0.00000000000000002',
            },
            current: {
              type: ItemType.ERC20,
              balance: BigInt(0),
              formattedBalance: '0',
              token: {
                name: '',
                symbol: '',
                address: '0xERC20',
                decimals: DEFAULT_TOKEN_DECIMALS,
              },
            },
            required: {
              type: ItemType.ERC20,
              balance: BigInt(20),
              formattedBalance: '0.00000000000000002',
              token: {
                name: '',
                symbol: '',
                address: '0xERC20',
                decimals: DEFAULT_TOKEN_DECIMALS,
              },
            },
            isFee: false,
            sufficient: false,
            type: ItemType.ERC20,
          },
        ]));
    });
  });

  describe('when multiple tokens are required', () => {
    it('should return sufficient if all balances are sufficient', async () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt('1'),
          isFee: true,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt('10'),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC721,
          id: '1234',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ];
      const getAllBalancesResult = {
        balances: [
          {
            balance: BigInt('10000000000000000'),
            formattedBalance: '1',
            token: {
              name: '',
              symbol: '',
              decimals: 18,
            },
          },
          {
            balance: BigInt('20000000000000000'),
            formattedBalance: '2',
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
              address: '0xERC20',
            },
          },
        ],
      };
      (getAllBalances as jest.Mock).mockResolvedValue(getAllBalancesResult);
      (Contract as unknown as jest.Mock).mockReturnValue({
        ownerOf: jest.fn().mockResolvedValue('0xADDRESS'),
      });

      const results = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      const { sufficient } = results;
      expect(sufficient).toBeTruthy();
    });

    it('should aggregate balance requirements', async () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigInt('1'),
          isFee: false,
        },
        {
          type: ItemType.NATIVE,
          amount: BigInt('1'),
          isFee: true,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt('10'),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
          isFee: false,
        },
        {
          type: ItemType.ERC20,
          amount: BigInt('10'),
          tokenAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
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
          id: '1',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ];
      const getAllBalancesResult = {
        balances: [
          {
            type: ItemType.NATIVE,
            balance: BigInt(1),
            formattedBalance: '0.000000000000000001',
            token: {
              name: '',
              symbol: '',
              decimals: 18,
            },
          },
        ],
      };
      (getAllBalances as jest.Mock).mockResolvedValue(getAllBalancesResult);
      (Contract as unknown as jest.Mock).mockReturnValue({
        ownerOf: jest.fn().mockResolvedValue('0xADDRESS'),
      });

      const result = await balanceCheck(
        config,
        mockProvider,
        '0xADDRESS',
        itemRequirements,
      ) as BalanceCheckResult;
      expect(result.sufficient).toBeFalsy();
      expect(result.balanceRequirements)
        .toEqual(expect.arrayContaining([
          {
            delta: {
              balance: BigInt(20),
              formattedBalance: '0.00000000000000002',
            },
            current: {
              type: ItemType.ERC20,
              balance: BigInt(0),
              formattedBalance: '0',
              token: {
                name: '',
                symbol: '',
                decimals: DEFAULT_TOKEN_DECIMALS,
                address: '0xERC20',
              },
            },
            required: {
              type: ItemType.ERC20,
              balance: BigInt(20),
              formattedBalance: '0.00000000000000002',
              token: {
                name: '',
                symbol: '',
                decimals: DEFAULT_TOKEN_DECIMALS,
                address: '0xERC20',
              },
            },
            sufficient: false,
            type: ItemType.ERC20,
            isFee: false,
          },
          {
            current: {
              type: ItemType.NATIVE,
              balance: BigInt(1),
              formattedBalance: '0.000000000000000001',
              token: ZKEVM_NATIVE_TOKEN,
            },
            delta: {
              balance: BigInt(0),
              formattedBalance: '0.0',
            },
            required: {
              type: ItemType.NATIVE,
              balance: BigInt(1),
              formattedBalance: '0.000000000000000001',
              token: ZKEVM_NATIVE_TOKEN,
            },
            sufficient: true,
            type: ItemType.NATIVE,
            isFee: false,
          },
          {
            current: {
              type: ItemType.NATIVE,
              balance: BigInt(0),
              formattedBalance: '0.0',
              token: ZKEVM_NATIVE_TOKEN,
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '0.000000000000000001',
            },
            required: {
              type: ItemType.NATIVE,
              balance: BigInt(1),
              formattedBalance: '0.000000000000000001',
              token: ZKEVM_NATIVE_TOKEN,
            },
            sufficient: false,
            type: ItemType.NATIVE,
            isFee: true,
          },
          {
            delta: {
              balance: BigInt(0),
              formattedBalance: '0',
            },
            current: {
              type: ItemType.ERC721,
              balance: BigInt(1),
              formattedBalance: '1',
              contractAddress: '0xERC721',
              id: '1',
            },
            required: {
              type: ItemType.ERC721,
              balance: BigInt(1),
              formattedBalance: '1',
              contractAddress: '0xERC721',
              id: '1',
            },
            sufficient: true,
            type: ItemType.ERC721,
            isFee: false,
          },
        ]));
    });

    it('should aggregate ERC721 when not owned', async () => {
      const itemRequirements: ItemRequirement[] = [
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
          type: ItemType.ERC721,
          id: '2',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ];
      const getBalancesResult = { balances: [] };
      (getAllBalances as jest.Mock).mockResolvedValue(getBalancesResult);

      // Mock ERC721 balance as not owned by the spender
      (Contract as unknown as jest.Mock).mockReturnValue({
        ownerOf: jest.fn().mockResolvedValue('0xSOMEONEELSE'),
      });

      const result = await balanceCheck(
        config,
        mockProvider,
        '0xADDRESS',
        itemRequirements,
      ) as BalanceCheckResult;
      expect(result.sufficient).toEqual(false);
      expect(result.balanceRequirements)
        .toEqual(expect.arrayContaining([
          {
            current: {
              type: ItemType.ERC721,
              balance: BigInt(0),
              formattedBalance: '0',
              contractAddress: '0xERC721',
              id: '1',
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1',
            },
            required: {
              type: ItemType.ERC721,
              balance: BigInt(1),
              formattedBalance: '1',
              contractAddress: '0xERC721',
              id: '1',
            },
            sufficient: false,
            type: ItemType.ERC721,
            isFee: false,
          },
          {
            current: {
              type: ItemType.ERC721,
              balance: BigInt(0),
              formattedBalance: '0',
              contractAddress: '0xERC721',
              id: '2',
            },
            delta: {
              balance: BigInt(1),
              formattedBalance: '1',
            },
            required: {
              type: ItemType.ERC721,
              balance: BigInt(1),
              formattedBalance: '1',
              contractAddress: '0xERC721',
              id: '2',
            },
            sufficient: false,
            type: ItemType.ERC721,
            isFee: false,
          },
        ]));
    });
  });

  describe('when requesting a cache reset', () => {
    const itemRequirements: ItemRequirement[] = [
      {
        type: ItemType.NATIVE,
        amount: BigInt(1),
        isFee: false,
      },
    ];
    const getBalancesResult = {
      balances:
        [
          {
            balance: BigInt(1),
            formattedBalance: '1',
            token: {
              name: '',
              symbol: '',
              decimals: 18,
            },
          },
        ],
    };
    it('should call getAllBalances with forceFetch = false when flag false or not provided', async () => {
      (getAllBalances as jest.Mock).mockResolvedValue(getBalancesResult);

      await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect((getAllBalances as jest.Mock))
        .toHaveBeenCalledWith(config, mockProvider, '0xADDRESS', expect.anything(), false);

      await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements, false);
      expect((getAllBalances as jest.Mock))
        .toHaveBeenLastCalledWith(config, mockProvider, '0xADDRESS', expect.anything(), false);
    });
    it('should call getAllBalances with forceFetch = true when flag true', async () => {
      (getAllBalances as jest.Mock).mockResolvedValue(getBalancesResult);

      await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements, true);
      expect((getAllBalances as jest.Mock))
        .toHaveBeenCalledWith(config, mockProvider, '0xADDRESS', expect.anything(), true);
    });
  });
});

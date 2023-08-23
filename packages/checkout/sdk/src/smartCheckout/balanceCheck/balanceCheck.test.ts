import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { BigNumber, Contract } from 'ethers';
import {
  DEFAULT_TOKEN_DECIMALS,
  IMX_ADDRESS_ZKEVM,
  ItemRequirement,
  ItemType,
} from '../../types';
import { balanceCheck } from './balanceCheck';
import { CheckoutConfiguration } from '../../config';
import { getAllBalances } from '../../balances';
import { BalanceCheckInsufficient } from './types';

jest.mock('../../balances');
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Contract: jest.fn(),
}));

describe('balanceCheck', () => {
  let config: CheckoutConfiguration;
  let mockProvider: Web3Provider;

  beforeEach(() => {
    jest.resetAllMocks();
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
      }),
      network: {
        chainId: 1,
      },
    } as unknown as Web3Provider;

    config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    });
  });

  describe('when NATIVE tokens are required', () => {
    it('should return sufficient if balance is sufficient', async () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(1),
        },
      ];
      const getAllBalancesResult = {
        balances:
          [
            {
              balance: BigNumber.from(1),
              formattedBalance: '1',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: IMX_ADDRESS_ZKEVM,
              },
            },
          ],
      };
      (getAllBalances as jest.Mock).mockResolvedValue(getAllBalancesResult);

      const balanceRequirements = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(balanceRequirements.sufficient).toEqual(true);
    });

    it('should return delta if balance is not sufficient', async () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(3),
        },
      ];
      const getAllBalancesResult = {
        balances:
          [
            {
              balance: BigNumber.from(1),
              formattedBalance: '0.000000000000000001',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: IMX_ADDRESS_ZKEVM,
              },
            },
          ],
      };
      (getAllBalances as jest.Mock).mockResolvedValue(getAllBalancesResult);

      const balanceRequirements = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(balanceRequirements.sufficient).toEqual(false);
      expect(balanceRequirements)
        .toEqual({
          itemRequirements: [
            {
              type: ItemType.NATIVE,
              sufficient: false,
              delta: {
                balance: BigNumber.from(2),
                formattedBalance: '0.000000000000000002',
              },
              current: getAllBalancesResult.balances[0],
              required: {
                balance: BigNumber.from(3),
                formattedBalance: '0.000000000000000003',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                  address: IMX_ADDRESS_ZKEVM,
                },
              },
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
          amount: BigNumber.from(10),
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
      ];
      const getAllBalancesResult = {
        balances:
          [
            {
              balance: BigNumber.from(20),
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
      (getAllBalances as jest.Mock).mockResolvedValue(getAllBalancesResult);

      const balanceRequirements = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(balanceRequirements.sufficient).toEqual(true);
    });

    it('should return delta if balance is not sufficient', async () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(10),
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
      ];
      const getAllBalancesResult = {
        balances:
          [
            {
              balance: BigNumber.from(5),
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
      (getAllBalances as jest.Mock).mockResolvedValue(getAllBalancesResult);

      const balanceRequirements = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(balanceRequirements.sufficient).toEqual(false);
      expect(balanceRequirements)
        .toEqual({
          itemRequirements: [
            {
              type: ItemType.ERC20,
              sufficient: false,
              delta: {
                balance: BigNumber.from(5),
                formattedBalance: '0.000000000000000005',
              },
              current: getAllBalancesResult.balances[0],
              required: {
                balance: BigNumber.from(10),
                formattedBalance: '0.00000000000000001',
                token: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                  address: '0xERC20',
                },
              },
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

      const balanceRequirements = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(balanceRequirements.sufficient).toEqual(true);
    });
  });

  describe('when no balances returned', () => {
    it('should aggregate balance requirements', async () => {
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
          amount: BigNumber.from(10),
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(10),
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
      ];
      const getAllBalancesResult = { balances: [] };
      (getAllBalances as jest.Mock).mockResolvedValue(getAllBalancesResult);
      (Contract as unknown as jest.Mock).mockReturnValue({
        ownerOf: jest.fn().mockResolvedValue('0xADDRESS'),
      });

      const balanceRequirements = await balanceCheck(
        config,
        mockProvider,
        '0xADDRESS',
        itemRequirements,
      ) as BalanceCheckInsufficient;
      expect(balanceRequirements.sufficient).toEqual(false);
      expect(balanceRequirements.itemRequirements)
        .toEqual(expect.arrayContaining([
          {
            current: {
              balance: BigNumber.from(0),
              formattedBalance: '0',
              token: {
                address: IMX_ADDRESS_ZKEVM,
                decimals: DEFAULT_TOKEN_DECIMALS,
                name: 'IMX',
                symbol: 'IMX',
              },
            },
            delta: {
              balance: BigNumber.from(2),
              formattedBalance: '0.000000000000000002',
            },
            required: {
              balance: BigNumber.from(2),
              formattedBalance: '0.000000000000000002',
              token: {
                address: IMX_ADDRESS_ZKEVM,
                decimals: DEFAULT_TOKEN_DECIMALS,
                name: 'IMX',
                symbol: 'IMX',
              },
            },
            sufficient: false,
            type: ItemType.NATIVE,
          },
          {
            delta: {
              balance: BigNumber.from(20),
              formattedBalance: '0.00000000000000002',
            },
            current: {
              balance: BigNumber.from(0),
              formattedBalance: '0',
              token: {
                address: '0xERC20',
              },
            },
            required: {
              balance: BigNumber.from(20),
              formattedBalance: '0.00000000000000002',
              token: {
                address: '0xERC20',
              },
            },
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
          amount: BigNumber.from(1),
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(10),
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC721,
          id: '1234',
          contractAddress: '0xERC721',
          spenderAddress: '0xSEAPORT',
        },
      ];
      const getAllBalancesResult = {
        balances:
          [
            {
              balance: BigNumber.from(1),
              formattedBalance: '1',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: IMX_ADDRESS_ZKEVM,
              },
            },
            {
              balance: BigNumber.from(20),
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
      (getAllBalances as jest.Mock).mockResolvedValue(getAllBalancesResult);
      (Contract as unknown as jest.Mock).mockReturnValue({
        ownerOf: jest.fn().mockResolvedValue('0xADDRESS'),
      });

      const balanceRequirements = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(balanceRequirements.sufficient).toEqual(true);
    });

    it('should aggregate balance requirements', async () => {
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
          amount: BigNumber.from(10),
          contractAddress: '0xERC20',
          spenderAddress: '0xSEAPORT',
        },
        {
          type: ItemType.ERC20,
          amount: BigNumber.from(10),
          contractAddress: '0xERC20',
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
      const getAllBalancesResult = {
        balances:
          [
            {
              balance: BigNumber.from(1),
              formattedBalance: '0.000000000000000001',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: IMX_ADDRESS_ZKEVM,
              },
            },
          ],
      };
      (getAllBalances as jest.Mock).mockResolvedValue(getAllBalancesResult);
      (Contract as unknown as jest.Mock).mockReturnValue({
        ownerOf: jest.fn().mockResolvedValue('0xADDRESS'),
      });

      const balanceRequirements = await balanceCheck(
        config,
        mockProvider,
        '0xADDRESS',
        itemRequirements,
      ) as BalanceCheckInsufficient;
      expect(balanceRequirements.sufficient).toEqual(false);
      expect(balanceRequirements.itemRequirements)
        .toEqual(expect.arrayContaining([
          {
            current: {
              balance: BigNumber.from(1),
              formattedBalance: '0.000000000000000001',
              token: {
                address: IMX_ADDRESS_ZKEVM,
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
              },
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '0.000000000000000001',
            },
            required: {
              balance: BigNumber.from(2),
              formattedBalance: '0.000000000000000002',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: IMX_ADDRESS_ZKEVM,
              },
            },
            sufficient: false,
            type: ItemType.NATIVE,
          },
          {
            delta: {
              balance: BigNumber.from(20),
              formattedBalance: '0.00000000000000002',
            },
            current: {
              balance: BigNumber.from(0),
              formattedBalance: '0',
              token: {
                address: '0xERC20',
              },
            },
            required: {
              balance: BigNumber.from(20),
              formattedBalance: '0.00000000000000002',
              token: {
                address: '0xERC20',
              },
            },
            sufficient: false,
            type: ItemType.ERC20,
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
      const getAllBalancesResult = { balances: [] };
      (getAllBalances as jest.Mock).mockResolvedValue(getAllBalancesResult);

      // Mock ERC721 balance as not owned by the spender
      (Contract as unknown as jest.Mock).mockReturnValue({
        ownerOf: jest.fn().mockResolvedValue('0xSOMEONEELSE'),
      });

      const balanceRequirements = await balanceCheck(
        config,
        mockProvider,
        '0xADDRESS',
        itemRequirements,
      ) as BalanceCheckInsufficient;
      expect(balanceRequirements.sufficient).toEqual(false);
      expect(balanceRequirements.itemRequirements)
        .toEqual(expect.arrayContaining([
          {
            current: {
              balance: BigNumber.from(0),
              formattedBalance: '0',
              contractAddress: '0xERC721',
              id: '1',
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1',
            },
            required: {
              balance: BigNumber.from(1),
              formattedBalance: '1',
              contractAddress: '0xERC721',
              id: '1',
            },
            sufficient: false,
            type: ItemType.ERC721,
          },
          {
            current: {
              balance: BigNumber.from(0),
              formattedBalance: '0',
              contractAddress: '0xERC721',
              id: '2',
            },
            delta: {
              balance: BigNumber.from(1),
              formattedBalance: '1',
            },
            required: {
              balance: BigNumber.from(1),
              formattedBalance: '1',
              contractAddress: '0xERC721',
              id: '2',
            },
            sufficient: false,
            type: ItemType.ERC721,
          },
        ]));
    });
  });
});

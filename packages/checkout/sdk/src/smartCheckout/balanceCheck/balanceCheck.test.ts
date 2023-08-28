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
import { getBalances } from '../../balances';
import { BalanceCheckResult } from './types';

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
      const getBalancesResult = {
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
      (getBalances as jest.Mock).mockResolvedValue(getBalancesResult);

      const { sufficient } = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(sufficient).toBeTruthy();
    });

    it('should return delta if balance is not sufficient', async () => {
      const itemRequirements: ItemRequirement[] = [
        {
          type: ItemType.NATIVE,
          amount: BigNumber.from(3),
        },
      ];
      const getBalancesResult = {
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
      (getBalances as jest.Mock).mockResolvedValue(getBalancesResult);

      const result = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(result)
        .toEqual({
          balanceRequirements: [
            {
              type: ItemType.NATIVE,
              sufficient: false,
              delta: {
                balance: BigNumber.from(2),
                formattedBalance: '0.000000000000000002',
              },
              current: getBalancesResult.balances[0],
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
      const getBalancesResult = {
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
      (getBalances as jest.Mock).mockResolvedValue(getBalancesResult);

      const { sufficient } = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(sufficient).toEqual(true);
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
      const getBalancesResult = {
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
      (getBalances as jest.Mock).mockResolvedValue(getBalancesResult);

      const result = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(result)
        .toEqual({
          balanceRequirements: [
            {
              type: ItemType.ERC20,
              sufficient: false,
              delta: {
                balance: BigNumber.from(5),
                formattedBalance: '0.000000000000000005',
              },
              current: getBalancesResult.balances[0],
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
      (getBalances as jest.Mock).mockResolvedValue({ balances: [] });
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
      const getBalancesResult = { balances: [] };
      (getBalances as jest.Mock).mockResolvedValue(getBalancesResult);
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
      const getBalancesResult = {
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
      (getBalances as jest.Mock).mockResolvedValue(getBalancesResult);
      (Contract as unknown as jest.Mock).mockReturnValue({
        ownerOf: jest.fn().mockResolvedValue('0xADDRESS'),
      });

      const { sufficient } = await balanceCheck(config, mockProvider, '0xADDRESS', itemRequirements);
      expect(sufficient).toBeTruthy();
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
      const getBalancesResult = {
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
      (getBalances as jest.Mock).mockResolvedValue(getBalancesResult);
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
      const getBalancesResult = { balances: [] };
      (getBalances as jest.Mock).mockResolvedValue(getBalancesResult);

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

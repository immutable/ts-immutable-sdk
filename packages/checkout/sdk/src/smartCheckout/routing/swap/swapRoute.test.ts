/* eslint-disable @typescript-eslint/naming-convention */
import { Environment } from '@imtbl/config';
import { Fee, Token } from '@imtbl/dex-sdk';
import { BigNumber, utils } from 'ethers';
import { CheckoutConfiguration } from '../../../config';
import { BalanceRequirement, BalanceCheckResult } from '../../balanceCheck/types';
import {
  swapRoute,
  getRequiredToken,
  checkUserCanCoverApprovalFees,
  checkUserCanCoverSwapFees,
  constructSwapRoute,
  checkIfUserCanCoverRequirement,
} from './swapRoute';
import {
  DexQuote,
  DexQuotes,
  TokenBalanceResult,
} from '../types';
import {
  ChainId,
  FeeType,
  FundingStepType,
  ItemType,
} from '../../../types';
import { quoteFetcher } from './quoteFetcher';
import { HttpClient } from '../../../api/http';
import { formatSmartCheckoutAmount } from '../../../utils/utils';

jest.mock('../../../config/remoteConfigFetcher');
jest.mock('./quoteFetcher');

describe('swapRoute', () => {
  const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  }, mockedHttpClient);

  const dexQuotes: DexQuotes = new Map<string, DexQuote>(
    [
      ['0xERC20_2',
        {
          quote: {
            amount: {
              value: BigNumber.from(1),
              token: {
                chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                name: 'ERC20_2',
                symbol: 'ERC20_2',
                decimals: 18,
                address: '0xERC20_2',
              } as Token,
            },
            amountWithMaxSlippage: {
              value: BigNumber.from(1),
              token: {} as Token,
            },
            slippage: 0,
            fees: [
              {
                amount: {
                  value: BigNumber.from(3),
                  token: {
                    chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                    name: 'IMX',
                    symbol: 'IMX',
                    decimals: 18,
                  } as Token,
                },
                recipient: '',
                basisPoints: 0,
              },
            ],
          },
          approval: {
            value: BigNumber.from(1),
            token: {
              chainId: ChainId.IMTBL_ZKEVM_TESTNET,
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            } as Token,
          },
          swap: {
            value: BigNumber.from(2),
            token: {
              chainId: ChainId.IMTBL_ZKEVM_TESTNET,
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            } as Token,
          },
        },
      ],
      ['0xERC20_3',
        {
          quote: {
            amount: {
              value: BigNumber.from(1),
              token: {
                chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                name: 'ERC20_3',
                symbol: 'ERC20_3',
                decimals: 18,
                address: '0xERC20_3',
              } as Token,
            },
            amountWithMaxSlippage: {
              value: BigNumber.from(1),
              token: {} as Token,
            },
            slippage: 0,
            fees: [
              {
                amount: {
                  value: BigNumber.from(3),
                  token: {
                    chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                    name: 'IMX',
                    symbol: 'IMX',
                    decimals: 18,
                  } as Token,
                },
                recipient: '',
                basisPoints: 0,
              },
            ],
          },
          approval: {
            value: BigNumber.from(1),
            token: {
              chainId: ChainId.IMTBL_ZKEVM_TESTNET,
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            } as Token,
          },
          swap: {
            value: BigNumber.from(2),
            token: {
              chainId: ChainId.IMTBL_ZKEVM_TESTNET,
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            } as Token,
          },
        },
      ],
    ],
  );

  describe('swapRoute', () => {
    beforeEach(() => {
      (quoteFetcher as jest.Mock).mockResolvedValue(dexQuotes);
    });

    it('should recommend swap route for ERC20', async () => {
      const balanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          token: {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(2),
          formattedBalance: '2',
          token: {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
        },
      } as BalanceRequirement;

      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.IMTBL_ZKEVM_TESTNET, {
          success: true,
          balances: [
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20_2',
              },
            },
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
          ],
        }],
      ]);

      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [balanceRequirement],
      };
      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2'],
        balanceRequirements,
      );

      expect(route).toEqual([
        {
          type: FundingStepType.SWAP,
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          fundingItem: {
            type: ItemType.ERC20,
            fundsRequired: {
              amount: BigNumber.from(1),
              formattedAmount: formatSmartCheckoutAmount(utils.formatUnits(BigNumber.from(1), 18)),
            },
            userBalance: {
              balance: BigNumber.from(10),
              formattedBalance: '10',
            },
            token: {
              address: '0xERC20_2',
              decimals: 18,
              name: 'ERC20',
              symbol: 'ERC20',
            },
          },
          fees: {
            approvalGasFee: {
              type: FeeType.GAS,
              amount: BigNumber.from(1),
              formattedAmount: utils.formatUnits(BigNumber.from(1), 18),
              token: {
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
                address: undefined,
              },
            },
            swapGasFee: {
              type: FeeType.GAS,
              amount: BigNumber.from(2),
              formattedAmount: utils.formatUnits(BigNumber.from(2), 18),
              token: {
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
                address: undefined,
              },
            },
            swapFees: [{
              type: FeeType.SWAP_FEE,
              amount: BigNumber.from(3),
              formattedAmount: utils.formatUnits(BigNumber.from(3), 18),
              basisPoints: 0,
              token: {
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
                address: undefined,
              },
            }],
          },
        },
      ]);
    });

    it('should recommend swap route for NATIVE', async () => {
      const balanceRequirement = {
        type: ItemType.NATIVE,
        sufficient: false,
        delta: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.NATIVE,
          balance: BigNumber.from(1),
          formattedBalance: '10',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
        required: {
          type: ItemType.NATIVE,
          balance: BigNumber.from(2),
          formattedBalance: '20',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      } as BalanceRequirement;

      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.IMTBL_ZKEVM_TESTNET, {
          success: true,
          balances: [
            {
              balance: BigNumber.from(10),
              formattedBalance: '18',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20_2',
              },
            },
          ],
        }],
      ]);

      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [balanceRequirement],
      };
      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2'],
        balanceRequirements,
      );

      expect(route).toEqual([
        {
          type: FundingStepType.SWAP,
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          fundingItem: {
            type: ItemType.ERC20,
            fundsRequired: {
              amount: BigNumber.from(1),
              formattedAmount: formatSmartCheckoutAmount(utils.formatUnits(BigNumber.from(1), 18)),
            },
            userBalance: {
              balance: BigNumber.from(10),
              formattedBalance: '10',
            },
            token: {
              address: '0xERC20_2',
              decimals: 18,
              name: 'ERC20',
              symbol: 'ERC20',
            },
          },
          fees: {
            approvalGasFee: {
              type: FeeType.GAS,
              amount: BigNumber.from(1),
              formattedAmount: utils.formatUnits(BigNumber.from(1), 18),
              token: {
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
                address: undefined,
              },
            },
            swapGasFee: {
              type: FeeType.GAS,
              amount: BigNumber.from(2),
              formattedAmount: utils.formatUnits(BigNumber.from(2), 18),
              token: {
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
                address: undefined,
              },
            },
            swapFees: [{
              type: FeeType.SWAP_FEE,
              amount: BigNumber.from(3),
              formattedAmount: utils.formatUnits(BigNumber.from(3), 18),
              basisPoints: 0,
              token: {
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
                address: undefined,
              },
            }],
          },
        },
      ]);
    });

    it('should recommend multiple swap route', async () => {
      const balanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          token: {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(2),
          formattedBalance: '2',
          token: {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
        },
      } as BalanceRequirement;

      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.IMTBL_ZKEVM_TESTNET, {
          success: true,
          balances: [
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20_2',
              },
            },
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'ERC20_3',
                symbol: 'ERC20_3',
                decimals: 18,
                address: '0xERC20_3',
              },
            },
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
          ],
        }],
      ]);

      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [balanceRequirement],
      };
      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2', '0xERC20_3'],
        balanceRequirements,
      );

      expect(route).toEqual([
        {
          type: FundingStepType.SWAP,
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          fundingItem: {
            type: ItemType.ERC20,
            fundsRequired: {
              amount: BigNumber.from(1),
              formattedAmount: formatSmartCheckoutAmount(utils.formatUnits(BigNumber.from(1), 18)),
            },
            userBalance: {
              balance: BigNumber.from(10),
              formattedBalance: '10',
            },
            token: {
              name: 'ERC20',
              symbol: 'ERC20',
              decimals: 18,
              address: '0xERC20_2',
            },
          },
          fees: {
            approvalGasFee: {
              type: FeeType.GAS,
              amount: BigNumber.from(1),
              formattedAmount: utils.formatUnits(BigNumber.from(1), 18),
              token: {
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
                address: undefined,
              },
            },
            swapGasFee: {
              type: FeeType.GAS,
              amount: BigNumber.from(2),
              formattedAmount: utils.formatUnits(BigNumber.from(2), 18),
              token: {
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
                address: undefined,
              },
            },
            swapFees: [{
              type: FeeType.SWAP_FEE,
              amount: BigNumber.from(3),
              formattedAmount: utils.formatUnits(BigNumber.from(3), 18),
              basisPoints: 0,
              token: {
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
                address: undefined,
              },
            }],
          },
        },
        {
          type: FundingStepType.SWAP,
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          fundingItem: {
            type: ItemType.ERC20,
            fundsRequired: {
              amount: BigNumber.from(1),
              formattedAmount: formatSmartCheckoutAmount(utils.formatUnits(BigNumber.from(1), 18)),
            },
            userBalance: {
              balance: BigNumber.from(10),
              formattedBalance: '10',
            },
            token: {
              name: 'ERC20_3',
              symbol: 'ERC20_3',
              decimals: 18,
              address: '0xERC20_3',
            },
          },
          fees: {
            approvalGasFee: {
              type: FeeType.GAS,
              amount: BigNumber.from(1),
              formattedAmount: utils.formatUnits(BigNumber.from(1), 18),
              token: {
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
                address: undefined,
              },
            },
            swapGasFee: {
              type: FeeType.GAS,
              amount: BigNumber.from(2),
              formattedAmount: utils.formatUnits(BigNumber.from(2), 18),
              token: {
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
                address: undefined,
              },
            },
            swapFees: [{
              type: FeeType.SWAP_FEE,
              amount: BigNumber.from(3),
              formattedAmount: utils.formatUnits(BigNumber.from(3), 18),
              basisPoints: 0,
              token: {
                decimals: 18,
                name: 'IMX',
                symbol: 'IMX',
                address: undefined,
              },
            }],
          },
        },
      ]);
    });

    it('should return empty array if swap not available', async () => {
      const balanceRequirement = {} as BalanceRequirement;
      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.IMTBL_ZKEVM_TESTNET, {
          success: true,
          balances: [
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
          ],
        }],
      ]);

      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [balanceRequirement],
      };
      const route = await swapRoute(
        config,
        {
          swap: false,
        },
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20', '0xERC20'],
        balanceRequirements,
      );
      expect(route).toEqual([]);
    });

    it('should return empty array if no swappable tokens', async () => {
      const balanceRequirement = {} as BalanceRequirement;
      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.IMTBL_ZKEVM_TESTNET, {
          success: true,
          balances: [
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
          ],
        }],
      ]);

      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [balanceRequirement],
      };
      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        '0xADDRESS',
        balanceRequirement,
        balances,
        [],
        balanceRequirements,
      );
      expect(route).toEqual([]);
    });

    it('should return empty array if no required token address', async () => {
      const balanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        current: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
          },
        },
        required: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
          },
        },
      } as BalanceRequirement;
      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.IMTBL_ZKEVM_TESTNET, {
          success: true,
          balances: [
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
              },
            },
          ],
        }],
      ]);

      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [balanceRequirement],
      };
      const routes = await swapRoute(
        config,
        {
          swap: true,
        },
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20'],
        balanceRequirements,
      );
      expect(routes).toEqual([]);
    });

    it('should return empty array if the user has no L2 balance', async () => {
      const balanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          token: {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(2),
          formattedBalance: '2',
          token: {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
        },
      } as BalanceRequirement;

      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.SEPOLIA, {
          success: true,
          balances: [
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20_2',
              },
            },
          ],
        }],
      ]);

      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [balanceRequirement],
      };
      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20'],
        balanceRequirements,
      );
      expect(route).toEqual([]);
    });

    it('should return empty array if user does not have balance of quoted token', async () => {
      const balanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          token: {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(2),
          formattedBalance: '2',
          token: {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
        },
      } as BalanceRequirement;

      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.IMTBL_ZKEVM_TESTNET, {
          success: true,
          balances: [
            {
              balance: BigNumber.from(1),
              formattedBalance: '1',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20_1',
              },
            },
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '',
              },
            },
          ],
        }],
      ]);

      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [balanceRequirement],
      };
      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2'],
        balanceRequirements,
      );

      expect(route).toEqual([]);
    });

    it('should return empty array if user does not have enough balance to cover the quoted token', async () => {
      const balanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          token: {
            name: 'ERC20_2',
            symbol: 'ERC20_2',
            decimals: 18,
            address: '0xERC20_2',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(2),
          formattedBalance: '2',
          token: {
            name: 'ERC20_2',
            symbol: 'ERC20_2',
            decimals: 18,
            address: '0xERC20_2',
          },
        },
      } as BalanceRequirement;

      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.IMTBL_ZKEVM_TESTNET, {
          success: true,
          balances: [
            {
              balance: BigNumber.from(1),
              formattedBalance: '1',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20_1',
              },
            },
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '',
              },
            },
          ],
        }],
      ]);

      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [balanceRequirement],
      };
      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2'],
        balanceRequirements,
      );

      expect(route).toEqual([]);
    });

    it('should return empty array if not enough to cover approval gas', async () => {
      const balanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          token: {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(2),
          formattedBalance: '2',
          token: {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
        },
      } as BalanceRequirement;

      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.IMTBL_ZKEVM_TESTNET, {
          success: true,
          balances: [
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20_2',
              },
            },
          ],
        }],
      ]);

      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [balanceRequirement],
      };
      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2'],
        balanceRequirements,
      );

      expect(route).toEqual([]);
    });

    it('should return empty array if not enough to cover swap fees', async () => {
      const balanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(1),
          formattedBalance: '1',
          token: {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(2),
          formattedBalance: '2',
          token: {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
        },
      } as BalanceRequirement;

      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.IMTBL_ZKEVM_TESTNET, {
          success: true,
          balances: [
            {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20_2',
              },
            },
            {
              balance: BigNumber.from(1),
              formattedBalance: '1',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '',
              },
            },
          ],
        }],
      ]);

      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [balanceRequirement],
      };
      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2'],
        balanceRequirements,
      );

      expect(route).toEqual([]);
    });
  });

  describe('constructSwapRoute', () => {
    it('should return type NATIVE', () => {
      const chainId = ChainId.IMTBL_ZKEVM_TESTNET;
      const fundsRequired = BigNumber.from(100);
      const userBalance = {
        balance: BigNumber.from(100),
        formattedBalance: '100',
        token: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
        },
      };
      const fees = {
        approvalGasFee: {
          type: FeeType.GAS,
          amount: BigNumber.from(1),
          formattedAmount: '1',
        },
        swapGasFee: {
          type: FeeType.GAS,
          amount: BigNumber.from(2),
          formattedAmount: '2',
        },
        swapFees: [{
          type: FeeType.SWAP_FEE,
          amount: BigNumber.from(3),
          formattedAmount: '3',
        }],
      };

      const route = constructSwapRoute(chainId, fundsRequired, userBalance, fees);
      expect(route).toEqual(
        {
          type: FundingStepType.SWAP,
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          fundingItem: {
            type: ItemType.NATIVE,
            fundsRequired: {
              amount: BigNumber.from(100),
              formattedAmount: formatSmartCheckoutAmount(utils.formatUnits(BigNumber.from(100), 18)),
            },
            userBalance: {
              balance: BigNumber.from(100),
              formattedBalance: '100',
            },
            token: {
              decimals: 18,
              name: 'IMX',
              symbol: 'IMX',
            },
          },
          fees,
        },
      );
    });

    it('should return type ERC20', () => {
      const chainId = ChainId.IMTBL_ZKEVM_TESTNET;
      const fundsRequired = BigNumber.from(100);
      const userBalance = {
        balance: BigNumber.from(100),
        formattedBalance: '100',
        token: {
          name: 'ERC20',
          symbol: 'ERC20',
          decimals: 18,
          address: '0xERC20',
        },
      };
      const fees = {
        approvalGasFee: {
          type: FeeType.GAS,
          amount: BigNumber.from(1),
          formattedAmount: '1',
        },
        swapGasFee: {
          type: FeeType.GAS,
          amount: BigNumber.from(2),
          formattedAmount: '2',
        },
        swapFees: [{
          type: FeeType.SWAP_FEE,
          amount: BigNumber.from(3),
          formattedAmount: '3',
        }],
      };

      const route = constructSwapRoute(chainId, fundsRequired, userBalance, fees);
      expect(route).toEqual(
        {
          type: FundingStepType.SWAP,
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          fundingItem: {
            type: ItemType.ERC20,
            fundsRequired: {
              amount: BigNumber.from(100),
              formattedAmount: formatSmartCheckoutAmount(utils.formatUnits(BigNumber.from(100), 18)),
            },
            userBalance: {
              balance: BigNumber.from(100),
              formattedBalance: '100',
            },
            token: {
              address: '0xERC20',
              decimals: 18,
              name: 'ERC20',
              symbol: 'ERC20',
            },
          },
          fees,
        },
      );
    });
  });

  describe('getRequiredToken', () => {
    it('should get address and amount for NATIVE', () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.NATIVE,
        sufficient: false,
        required: {
          type: ItemType.NATIVE,
          token: {
            name: 'NATIVE',
            symbol: 'NATIVE',
            decimals: 18,
          },
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.NATIVE,
          token: {
            name: 'NATIVE',
            symbol: 'NATIVE',
            decimals: 18,
          },
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        delta: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
      };

      const requiredToken = getRequiredToken(balanceRequirement);
      expect(requiredToken).toEqual(
        {
          address: '',
          amount: BigNumber.from(1),
        },
      );
    });

    it('should get address and amount for ERC20', () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        required: {
          type: ItemType.ERC20,
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20',
          },
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
        delta: {
          balance: BigNumber.from(1),
          formattedBalance: '1',
        },
      };

      const requiredToken = getRequiredToken(balanceRequirement);
      expect(requiredToken).toEqual(
        {
          address: '0xERC20',
          amount: BigNumber.from(1),
        },
      );
    });
  });

  describe('checkUserCanCoverApprovalFees', () => {
    it('should return sufficient true if no approval required', () => {
      const approvalFees = checkUserCanCoverApprovalFees(
        [
          {
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        ],
        null,
      );

      expect(approvalFees).toEqual(
        {
          sufficient: true,
          approvalGasFee: BigNumber.from(0),
          approvalGasTokenAddress: '',
        },
      );
    });

    it('should return sufficient false if user has no balances on L2', () => {
      const approvalFees = checkUserCanCoverApprovalFees(
        [],
        {
          value: BigNumber.from(1),
          token: {
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '',
          },
        },
      );

      expect(approvalFees).toEqual(
        {
          sufficient: false,
          approvalGasFee: BigNumber.from(1),
          approvalGasTokenAddress: '',
        },
      );
    });

    it('should return sufficient false if user has no balance of approval token', () => {
      const approvalFees = checkUserCanCoverApprovalFees(
        [
          {
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'ERC20',
              symbol: 'ERC20',
              decimals: 18,
              address: '0xERC20',
            },
          },
        ],
        {
          value: BigNumber.from(1),
          token: {
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '',
          },
        },
      );

      expect(approvalFees).toEqual(
        {
          sufficient: false,
          approvalGasFee: BigNumber.from(1),
          approvalGasTokenAddress: '',
        },
      );
    });

    it('should return sufficient false if user has not enough balance of approval token', () => {
      const approvalFees = checkUserCanCoverApprovalFees(
        [
          {
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        ],
        {
          value: BigNumber.from(2),
          token: {
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '',
          },
        },
      );

      expect(approvalFees).toEqual(
        {
          sufficient: false,
          approvalGasFee: BigNumber.from(2),
          approvalGasTokenAddress: '',
        },
      );
    });

    it('should return sufficient true if user has enough balance of approval token', () => {
      const approvalFees = checkUserCanCoverApprovalFees(
        [
          {
            balance: BigNumber.from(2),
            formattedBalance: '2',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        ],
        {
          value: BigNumber.from(1),
          token: {
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '',
          } as Token,
        },
      );

      expect(approvalFees).toEqual(
        {
          sufficient: true,
          approvalGasFee: BigNumber.from(1),
          approvalGasTokenAddress: '',
        },
      );
    });
  });

  describe('checkUserCanCoverSwapFees', () => {
    it('should return true if user has enough balance to cover gas fees', () => {
      const l2Balances = [
        {
          balance: BigNumber.from(2),
          formattedBalance: '2',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      ];

      const swapFees: Fee[] = [];

      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(0),
        approvalGasTokenAddress: '',
      };

      const swapGasFee = {
        token: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          address: '',
          decimals: 18,
        },
        value: BigNumber.from(1),
      };

      const tokenBeingSwapped = {
        amount: BigNumber.from(1),
        address: '',
      };

      const canCoverSwapFees = checkUserCanCoverSwapFees(
        l2Balances,
        approvalFees,
        swapGasFee,
        swapFees,
        tokenBeingSwapped,
      );

      expect(canCoverSwapFees).toBeTruthy();
    });

    it('should return true if user has enough balance to cover gas and swap fees', () => {
      const l2Balances = [
        {
          balance: BigNumber.from(3),
          formattedBalance: '3',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      ];

      const swapFees: Fee[] = [
        {
          recipient: '',
          basisPoints: 0,
          amount: {
            value: BigNumber.from(1),
            token: {
              chainId: ChainId.IMTBL_ZKEVM_TESTNET,
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '',
            },
          },
        },
      ];

      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(0),
        approvalGasTokenAddress: '',
      };

      const swapGasFee = {
        token: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          address: '',
          decimals: 18,
        },
        value: BigNumber.from(1),
      };

      const tokenBeingSwapped = {
        amount: BigNumber.from(1),
        address: '',
      };

      const canCoverSwapFees = checkUserCanCoverSwapFees(
        l2Balances,
        approvalFees,
        swapGasFee,
        swapFees,
        tokenBeingSwapped,
      );

      expect(canCoverSwapFees).toBeTruthy();
    });

    it('should return true if user has enough balance to cover the approval, gas and swap fees', () => {
      const l2Balances = [
        {
          balance: BigNumber.from(4),
          formattedBalance: '4',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      ];

      const swapFees: Fee[] = [
        {
          recipient: '',
          basisPoints: 0,
          amount: {
            value: BigNumber.from(1),
            token: {
              chainId: ChainId.IMTBL_ZKEVM_TESTNET,
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '',
            },
          },
        },
      ];

      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(1),
        approvalGasTokenAddress: '',
      };

      const swapGasFee = {
        token: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          address: '',
          decimals: 18,
        },
        value: BigNumber.from(1),
      };

      const tokenBeingSwapped = {
        amount: BigNumber.from(1),
        address: '',
      };

      const canCoverSwapFees = checkUserCanCoverSwapFees(
        l2Balances,
        approvalFees,
        swapGasFee,
        swapFees,
        tokenBeingSwapped,
      );

      expect(canCoverSwapFees).toBeTruthy();
    });

    it(
      `should return true if user has enough balance to cover approval,
      swap fees and token being swapped for various tokens`,
      () => {
        const l2Balances = [
          {
            balance: BigNumber.from(6),
            formattedBalance: '6',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0xERC20_1',
            },
          },
          {
            balance: BigNumber.from(5),
            formattedBalance: '5',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0xERC20_2',
            },
          },
          {
            balance: BigNumber.from(5),
            formattedBalance: '5',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0xERC20_3',
            },
          },
        ];

        const swapFees: Fee[] = [
          {
            recipient: '',
            basisPoints: 0,
            amount: {
              value: BigNumber.from(1),
              token: {
                chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0xERC20_1',
              },
            },
          },
          {
            recipient: '',
            basisPoints: 0,
            amount: {
              value: BigNumber.from(5),
              token: {
                chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0xERC20_2',
              },
            },
          },
          {
            recipient: '',
            basisPoints: 0,
            amount: {
              value: BigNumber.from(5),
              token: {
                chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0xERC20_3',
              },
            },
          },
        ];

        const approvalFees = {
          sufficient: true,
          approvalGasFee: BigNumber.from(1),
          approvalGasTokenAddress: '0xERC20_1',
        };

        const swapGasFee = {
          token: {
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            address: '0xERC20_1',
            decimals: 18,
          },
          value: BigNumber.from(1),
        };

        const tokenBeingSwapped = {
          amount: BigNumber.from(3),
          address: '0xERC20_1',
        };

        const canCoverSwapFees = checkUserCanCoverSwapFees(
          l2Balances,
          approvalFees,
          swapGasFee,
          swapFees,
          tokenBeingSwapped,
        );

        expect(canCoverSwapFees).toBeTruthy();
      },
    );

    it('should return false if user does not have enough balance to cover gas', () => {
      const l2Balances = [
        {
          balance: BigNumber.from(1),
          formattedBalance: '1',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '',
          },
        },
      ];

      const swapFees: Fee[] = [];

      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(0),
        approvalGasTokenAddress: '',
      };

      const swapGasFee = {
        token: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          address: '',
          decimals: 18,
        },
        value: BigNumber.from(1),
      };

      const tokenBeingSwapped = {
        amount: BigNumber.from(1),
        address: '',
      };

      const canCoverSwapFees = checkUserCanCoverSwapFees(
        l2Balances,
        approvalFees,
        swapGasFee,
        swapFees,
        tokenBeingSwapped,
      );

      expect(canCoverSwapFees).toBeFalsy();
    });

    it('should return false if user does not have enough balance to cover the fee', () => {
      const l2Balances = [
        {
          balance: BigNumber.from(2),
          formattedBalance: '2',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '',
          },
        },
      ];

      const swapFees: Fee[] = [
        {
          recipient: '',
          basisPoints: 0,
          amount: {
            value: BigNumber.from(1),
            token: {
              chainId: ChainId.IMTBL_ZKEVM_TESTNET,
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '',
            },
          },
        },
      ];

      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(0),
        approvalGasTokenAddress: '',
      };

      const swapGasFee = {
        token: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          address: '',
          decimals: 18,
        },
        value: BigNumber.from(1),
      };

      const tokenBeingSwapped = {
        amount: BigNumber.from(1),
        address: '',
      };

      const canCoverSwapFees = checkUserCanCoverSwapFees(
        l2Balances,
        approvalFees,
        swapGasFee,
        swapFees,
        tokenBeingSwapped,
      );

      expect(canCoverSwapFees).toBeFalsy();
    });

    it('should return false if user does not have enough balance to cover the approval, gas and fees', () => {
      const l2Balances = [
        {
          balance: BigNumber.from(3),
          formattedBalance: '3',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      ];

      const swapFees: Fee[] = [
        {
          recipient: '',
          basisPoints: 0,
          amount: {
            value: BigNumber.from(1),
            token: {
              chainId: ChainId.IMTBL_ZKEVM_TESTNET,
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '',
            },
          },
        },
      ];

      const swapGasFee = {
        token: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          address: '',
          decimals: 18,
        },
        value: BigNumber.from(1),
      };

      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(1),
        approvalGasTokenAddress: '',
      };

      const tokenBeingSwapped = {
        amount: BigNumber.from(1),
        address: '',
      };

      const canCoverSwapFees = checkUserCanCoverSwapFees(
        l2Balances,
        approvalFees,
        swapGasFee,
        swapFees,
        tokenBeingSwapped,
      );

      expect(canCoverSwapFees).toBeFalsy();
    });

    it('should return false if user has no balance of the fee token', () => {
      const l2Balances = [
        {
          balance: BigNumber.from(1),
          formattedBalance: '1',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xERC20',
          },
        },
      ];

      const swapFees: Fee[] = [
        {
          recipient: '',
          basisPoints: 0,
          amount: {
            value: BigNumber.from(1),
            token: {
              chainId: ChainId.IMTBL_ZKEVM_TESTNET,
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0xERC20',
            },
          },
        },
      ];

      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(1),
        approvalGasTokenAddress: '',
      };

      const swapGasFee = {
        token: {
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          address: '',
          decimals: 18,
        },
        value: BigNumber.from(1),
      };

      const tokenBeingSwapped = {
        amount: BigNumber.from(1),
        address: '',
      };

      const canCoverSwapFees = checkUserCanCoverSwapFees(
        l2Balances,
        approvalFees,
        swapGasFee,
        swapFees,
        tokenBeingSwapped,
      );

      expect(canCoverSwapFees).toBeFalsy();
    });
  });

  describe('checkIfUserCanCoverRequirement', () => {
    it('should return true if token being swapped is not a balance requirement', () => {
      const balanceRequirements: BalanceCheckResult = {
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.ERC20,
            required: {
              type: ItemType.ERC20,
              balance: BigNumber.from(2),
              formattedBalance: '2',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20',
              },
            },
          } as BalanceRequirement,
        ],
      };
      const quoteTokenAddress = '0xIMX';
      const amountBeingSwapped = BigNumber.from(10);
      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(5),
        approvalGasTokenAddress: '0xIMX',
      };
      const swapFees: Fee[] = [];
      const l2balance = BigNumber.from(1);
      const canCoverRequirement = checkIfUserCanCoverRequirement(
        l2balance,
        balanceRequirements,
        quoteTokenAddress,
        amountBeingSwapped,
        approvalFees,
        swapFees,
      );

      expect(canCoverRequirement).toBeTruthy();
    });

    it('should return true if token being swapped is a balance requirement and user has enough balance', () => {
      const balanceRequirements: BalanceCheckResult = {
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.ERC20,
            required: {
              type: ItemType.ERC20,
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20',
              },
            },
          } as BalanceRequirement,
        ],
      };
      const quoteTokenAddress = '0xERC20';
      const amountBeingSwapped = BigNumber.from(10);
      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(5),
        approvalGasTokenAddress: '0xIMX',
      };
      const swapFees: Fee[] = [];

      const l2balance = BigNumber.from(25);
      const canCoverRequirement = checkIfUserCanCoverRequirement(
        l2balance,
        balanceRequirements,
        quoteTokenAddress,
        amountBeingSwapped,
        approvalFees,
        swapFees,
      );

      expect(canCoverRequirement).toBeTruthy();
    });

    it(
      `should return true if token being swapped is a balance requirement and for 
      gas and user has enough balance`,
      () => {
        const balanceRequirements: BalanceCheckResult = {
          sufficient: false,
          balanceRequirements: [
            {
              type: ItemType.ERC20,
              required: {
                type: ItemType.ERC20,
                balance: BigNumber.from(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20',
                },
              },
            } as BalanceRequirement,
          ],
        };
        const quoteTokenAddress = '0xERC20';
        const amountBeingSwapped = BigNumber.from(10);
        const approvalFees = {
          sufficient: true,
          approvalGasFee: BigNumber.from(5),
          approvalGasTokenAddress: '0xERC20',
        };
        const swapFees: Fee[] = [
          {
            recipient: '0xRECIPIENT',
            basisPoints: 0,
            amount: {
              value: BigNumber.from(5),
              token: {
                chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20',
              },
            },
          },
          {
            recipient: '0xRECIPIENT',
            basisPoints: 0,
            amount: {
              value: BigNumber.from(5),
              token: {
                chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20',
              },
            },
          },
        ];

        const l2balance = BigNumber.from(35);
        const canCoverRequirement = checkIfUserCanCoverRequirement(
          l2balance,
          balanceRequirements,
          quoteTokenAddress,
          amountBeingSwapped,
          approvalFees,
          swapFees,
        );

        expect(canCoverRequirement).toBeTruthy();
      },
    );

    it(
      'should return false if token being swapped is a balance requirement and user does not have enough balance',
      () => {
        const balanceRequirements: BalanceCheckResult = {
          sufficient: false,
          balanceRequirements: [
            {
              type: ItemType.ERC20,
              required: {
                type: ItemType.ERC20,
                balance: BigNumber.from(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20',
                },
              },
            } as BalanceRequirement,
          ],
        };
        const quoteTokenAddress = '0xERC20';
        const amountBeingSwapped = BigNumber.from(10);
        const approvalFees = {
          sufficient: true,
          approvalGasFee: BigNumber.from(5),
          approvalGasTokenAddress: '0xIMX',
        };
        const swapFees: Fee[] = [];

        const l2balance = BigNumber.from(9);
        const canCoverRequirement = checkIfUserCanCoverRequirement(
          l2balance,
          balanceRequirements,
          quoteTokenAddress,
          amountBeingSwapped,
          approvalFees,
          swapFees,
        );

        expect(canCoverRequirement).toBeFalsy();
      },
    );

    it(
      `should return false if token being swapped is a balance requirement and for 
      gas and user does not have enough balance`,
      () => {
        const balanceRequirements: BalanceCheckResult = {
          sufficient: false,
          balanceRequirements: [
            {
              type: ItemType.ERC20,
              required: {
                type: ItemType.ERC20,
                balance: BigNumber.from(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20',
                },
              },
            } as BalanceRequirement,
          ],
        };
        const quoteTokenAddress = '0xERC20';
        const amountBeingSwapped = BigNumber.from(10);
        const approvalFees = {
          sufficient: true,
          approvalGasFee: BigNumber.from(5),
          approvalGasTokenAddress: '0xERC20',
        };
        const swapFees: Fee[] = [
          {
            recipient: '0xRECIPIENT',
            basisPoints: 0,
            amount: {
              value: BigNumber.from(5),
              token: {
                chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20',
              },
            },
          },
          {
            recipient: '0xRECIPIENT',
            basisPoints: 0,
            amount: {
              value: BigNumber.from(5),
              token: {
                chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                name: 'ERC20',
                symbol: 'ERC20',
                decimals: 18,
                address: '0xERC20',
              },
            },
          },
        ];

        const l2balance = BigNumber.from(34);
        const canCoverRequirement = checkIfUserCanCoverRequirement(
          l2balance,
          balanceRequirements,
          quoteTokenAddress,
          amountBeingSwapped,
          approvalFees,
          swapFees,
        );

        expect(canCoverRequirement).toBeFalsy();
      },
    );
  });
});

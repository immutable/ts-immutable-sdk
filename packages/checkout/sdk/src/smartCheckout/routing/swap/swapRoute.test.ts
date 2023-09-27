/* eslint-disable @typescript-eslint/naming-convention */
import { Environment } from '@imtbl/config';
import { Fee, TokenInfo } from '@imtbl/dex-sdk';
import { BigNumber } from 'ethers';
import { CheckoutConfiguration } from '../../../config';
import { BalanceRequirement } from '../../balanceCheck/types';
import {
  swapRoute,
  getRequiredToken,
  checkUserCanCoverApprovalFees,
  checkUserCanCoverSwapFees,
} from './swapRoute';
import {
  DexQuote,
  DexQuoteCache,
  DexQuotes,
  TokenBalanceResult,
} from '../types';
import {
  ChainId,
  FundingRouteType,
  IMX_ADDRESS_ZKEVM,
  ItemType,
} from '../../../types';

jest.mock('../../../config/remoteConfigFetcher');

describe('swapRoute', () => {
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  });

  const cache: DexQuoteCache = new Map<string, DexQuotes>(
    [
      [
        '0xERC20_1',
        new Map<string, DexQuote>([
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
                  } as TokenInfo,
                },
                amountWithMaxSlippage: {
                  value: BigNumber.from(1),
                  token: {} as TokenInfo,
                },
                slippage: 0,
                fees: [
                  {
                    amount: {
                      value: BigNumber.from(1),
                      token: {
                        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                        name: 'IMX',
                        symbol: 'IMX',
                        decimals: 18,
                        address: IMX_ADDRESS_ZKEVM,
                      } as TokenInfo,
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
                  address: IMX_ADDRESS_ZKEVM,
                } as TokenInfo,
              },
              swap: {
                value: BigNumber.from(1),
                token: {} as TokenInfo,
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
                  } as TokenInfo,
                },
                amountWithMaxSlippage: {
                  value: BigNumber.from(1),
                  token: {} as TokenInfo,
                },
                slippage: 0,
                fees: [
                  {
                    amount: {
                      value: BigNumber.from(1),
                      token: {
                        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                        name: 'IMX',
                        symbol: 'IMX',
                        decimals: 18,
                        address: IMX_ADDRESS_ZKEVM,
                      } as TokenInfo,
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
                  address: IMX_ADDRESS_ZKEVM,
                } as TokenInfo,
              },
              swap: {
                value: BigNumber.from(1),
                token: {} as TokenInfo,
              },
            },
          ],
        ]),
      ],
      [
        '0xERC20_2',
        new Map<string, DexQuote>([
          ['0xERC20_1',
            {
              quote: {
                amount: {
                  value: BigNumber.from(2),
                  token: {
                    chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                    name: 'ERC20_1',
                    symbol: 'ERC20_1',
                    decimals: 18,
                    address: '0xERC20_1',
                  } as TokenInfo,
                },
                amountWithMaxSlippage: {
                  value: BigNumber.from(2),
                  token: {} as TokenInfo,
                },
                slippage: 0,
                fees: [
                  {
                    amount: {
                      value: BigNumber.from(2),
                      token: {
                        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                        name: 'IMX',
                        symbol: 'IMX',
                        decimals: 18,
                        address: IMX_ADDRESS_ZKEVM,
                      } as TokenInfo,
                    },
                    recipient: '',
                    basisPoints: 0,
                  },
                ],
              },
              approval: {
                value: BigNumber.from(2),
                token: {
                  chainId: ChainId.IMTBL_ZKEVM_TESTNET,
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                  address: IMX_ADDRESS_ZKEVM,
                } as TokenInfo,
              },
              swap: {
                value: BigNumber.from(2),
                token: {} as TokenInfo,
              },
            },
          ],
        ]),
      ],
    ],
  );

  describe('swapRoute', () => {
    it('should recommend swap route', async () => {
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
                address: IMX_ADDRESS_ZKEVM,
              },
            },
          ],
        }],
      ]);

      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        cache,
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2'],
      );

      expect(route).toEqual([
        {
          type: FundingRouteType.SWAP,
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          asset: {
            balance: BigNumber.from(10),
            formattedBalance: '10',
            token: {
              name: 'ERC20',
              symbol: 'ERC20',
              decimals: 18,
              address: '0xERC20_2',
            },
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
                address: IMX_ADDRESS_ZKEVM,
              },
            },
          ],
        }],
      ]);

      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        cache,
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2', '0xERC20_3'],
      );

      expect(route).toEqual([
        {
          type: FundingRouteType.SWAP,
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          asset: {
            balance: BigNumber.from(10),
            formattedBalance: '10',
            token: {
              name: 'ERC20',
              symbol: 'ERC20',
              decimals: 18,
              address: '0xERC20_2',
            },
          },
        },
        {
          type: FundingRouteType.SWAP,
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          asset: {
            balance: BigNumber.from(10),
            formattedBalance: '10',
            token: {
              name: 'ERC20_3',
              symbol: 'ERC20_3',
              decimals: 18,
              address: '0xERC20_3',
            },
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
                address: IMX_ADDRESS_ZKEVM,
              },
            },
          ],
        }],
      ]);

      const route = await swapRoute(
        config,
        {
          swap: false,
        },
        cache,
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20', '0xERC20'],
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
                address: IMX_ADDRESS_ZKEVM,
              },
            },
          ],
        }],
      ]);

      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        cache,
        '0xADDRESS',
        balanceRequirement,
        balances,
        [],
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
                address: IMX_ADDRESS_ZKEVM,
              },
            },
          ],
        }],
      ]);

      const routes = await swapRoute(
        config,
        {
          swap: true,
        },
        cache,
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20'],
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

      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        cache,
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20'],
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
                address: IMX_ADDRESS_ZKEVM,
              },
            },
          ],
        }],
      ]);

      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        cache,
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2'],
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
                address: IMX_ADDRESS_ZKEVM,
              },
            },
          ],
        }],
      ]);

      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        cache,
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2'],
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

      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        cache,
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2'],
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
                address: IMX_ADDRESS_ZKEVM,
              },
            },
          ],
        }],
      ]);

      const route = await swapRoute(
        config,
        {
          swap: true,
        },
        cache,
        '0xADDRESS',
        balanceRequirement,
        balances,
        ['0xERC20_1', '0xERC20_2'],
      );

      expect(route).toEqual([]);
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
          address: IMX_ADDRESS_ZKEVM,
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
              address: IMX_ADDRESS_ZKEVM,
            },
          },
        ],
        undefined,
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
            address: IMX_ADDRESS_ZKEVM,
          },
        },
      );

      expect(approvalFees).toEqual(
        {
          sufficient: false,
          approvalGasFee: BigNumber.from(1),
          approvalGasTokenAddress: IMX_ADDRESS_ZKEVM,
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
            address: IMX_ADDRESS_ZKEVM,
          },
        },
      );

      expect(approvalFees).toEqual(
        {
          sufficient: false,
          approvalGasFee: BigNumber.from(1),
          approvalGasTokenAddress: IMX_ADDRESS_ZKEVM,
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
              address: IMX_ADDRESS_ZKEVM,
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
            address: IMX_ADDRESS_ZKEVM,
          },
        },
      );

      expect(approvalFees).toEqual(
        {
          sufficient: false,
          approvalGasFee: BigNumber.from(2),
          approvalGasTokenAddress: IMX_ADDRESS_ZKEVM,
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
              address: IMX_ADDRESS_ZKEVM,
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
            address: IMX_ADDRESS_ZKEVM,
          },
        },
      );

      expect(approvalFees).toEqual(
        {
          sufficient: true,
          approvalGasFee: BigNumber.from(1),
          approvalGasTokenAddress: IMX_ADDRESS_ZKEVM,
        },
      );
    });
  });

  describe('checkUserCanCoverSwapFees', () => {
    it('should return true if user has enough balance to cover the swap fees', () => {
      const l2Balances = [
        {
          balance: BigNumber.from(2),
          formattedBalance: '2',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: IMX_ADDRESS_ZKEVM,
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
              address: IMX_ADDRESS_ZKEVM,
            },
          },
        },
      ];

      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(0),
        approvalGasTokenAddress: '',
      };

      const tokenBeingSwapped = {
        amount: BigNumber.from(1),
        address: IMX_ADDRESS_ZKEVM,
      };

      const canCoverSwapFees = checkUserCanCoverSwapFees(
        l2Balances,
        swapFees,
        approvalFees,
        tokenBeingSwapped,
      );

      expect(canCoverSwapFees).toBeTruthy();
    });

    it('should return true if user has enough balance to cover the approval and swap fees', () => {
      const l2Balances = [
        {
          balance: BigNumber.from(3),
          formattedBalance: '3',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: IMX_ADDRESS_ZKEVM,
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
              address: IMX_ADDRESS_ZKEVM,
            },
          },
        },
      ];

      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(1),
        approvalGasTokenAddress: IMX_ADDRESS_ZKEVM,
      };

      const tokenBeingSwapped = {
        amount: BigNumber.from(1),
        address: IMX_ADDRESS_ZKEVM,
      };

      const canCoverSwapFees = checkUserCanCoverSwapFees(
        l2Balances,
        swapFees,
        approvalFees,
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
            balance: BigNumber.from(5),
            formattedBalance: '5',
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

        const tokenBeingSwapped = {
          amount: BigNumber.from(3),
          address: '0xERC20_1',
        };

        const canCoverSwapFees = checkUserCanCoverSwapFees(
          l2Balances,
          swapFees,
          approvalFees,
          tokenBeingSwapped,
        );

        expect(canCoverSwapFees).toBeTruthy();
      },
    );

    it('should return false if user does not have enough balance to cover the fee', () => {
      const l2Balances = [
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
              address: IMX_ADDRESS_ZKEVM,
            },
          },
        },
      ];

      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(0),
        approvalGasTokenAddress: '',
      };

      const tokenBeingSwapped = {
        amount: BigNumber.from(1),
        address: IMX_ADDRESS_ZKEVM,
      };

      const canCoverSwapFees = checkUserCanCoverSwapFees(
        l2Balances,
        swapFees,
        approvalFees,
        tokenBeingSwapped,
      );

      expect(canCoverSwapFees).toBeFalsy();
    });

    it('should return false if user does not have enough balance to cover the approval and fees', () => {
      const l2Balances = [
        {
          balance: BigNumber.from(2),
          formattedBalance: '2',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: IMX_ADDRESS_ZKEVM,
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
              address: IMX_ADDRESS_ZKEVM,
            },
          },
        },
      ];

      const approvalFees = {
        sufficient: true,
        approvalGasFee: BigNumber.from(1),
        approvalGasTokenAddress: IMX_ADDRESS_ZKEVM,
      };

      const tokenBeingSwapped = {
        amount: BigNumber.from(1),
        address: IMX_ADDRESS_ZKEVM,
      };

      const canCoverSwapFees = checkUserCanCoverSwapFees(
        l2Balances,
        swapFees,
        approvalFees,
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
        approvalGasTokenAddress: IMX_ADDRESS_ZKEVM,
      };

      const tokenBeingSwapped = {
        amount: BigNumber.from(1),
        address: IMX_ADDRESS_ZKEVM,
      };

      const canCoverSwapFees = checkUserCanCoverSwapFees(
        l2Balances,
        swapFees,
        approvalFees,
        tokenBeingSwapped,
      );

      expect(canCoverSwapFees).toBeFalsy();
    });
  });
});

import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { TokenInfo } from '@imtbl/dex-sdk';
import { getSwapFundingStep, routingCalculator } from './routingCalculator';
import { CheckoutConfiguration } from '../../config';
import { getAllTokenBalances } from './tokenBalances';
import {
  DexQuote, DexQuoteCache, DexQuotes, RouteCalculatorType, TokenBalanceResult,
} from './types';
import { bridgeRoute } from './bridge/bridgeRoute';
import {
  ChainId, FundingRouteType, IMX_ADDRESS_ZKEVM, ItemType,
} from '../../types';
import { BalanceCheckResult, BalanceERC20Requirement, BalanceRequirement } from '../balanceCheck/types';
import { createReadOnlyProviders } from '../../readOnlyProviders/readOnlyProvider';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { swapRoute } from './swap/swapRoute';
import { allowListCheck } from '../allowList';
import { onRampRoute } from './onRamp';

jest.mock('./tokenBalances');
jest.mock('./bridge/bridgeRoute');
jest.mock('../../readOnlyProviders/readOnlyProvider');
jest.mock('../../config/remoteConfigFetcher');
jest.mock('./swap/swapRoute');
jest.mock('./onRamp/onRampRoute');
jest.mock('../allowList');

describe('routingCalculator', () => {
  let config: CheckoutConfiguration;

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

  beforeEach(() => {
    config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    });
  });

  it('should return no options if no routing options are available', async () => {
    const availableRoutingOptions = {
      onRamp: false,
      swap: false,
      bridge: false,
    };

    const balanceRequirements = {} as BalanceCheckResult;
    (createReadOnlyProviders as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, {} as JsonRpcProvider],
      [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
    ]));

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
    );
    expect(routingOptions)
      .toEqual({
        response: {
          type: RouteCalculatorType.NO_OPTIONS,
          message: 'No options available',
        },
        fundingRoutes: [],
      });
  });

  it('should return no options if no routing options are defined', async () => {
    const availableRoutingOptions = {};
    const balanceRequirements = {} as BalanceCheckResult;
    (createReadOnlyProviders as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, {} as JsonRpcProvider],
      [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
    ]));

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
    );
    expect(routingOptions)
      .toEqual({
        response: {
          type: RouteCalculatorType.NO_OPTIONS,
          message: 'No options available',
        },
        fundingRoutes: [],
      });
  });

  it('should return bridge funding step', async () => {
    (allowListCheck as jest.Mock).mockImplementation(() => (
      {
        bridge: [{
          name: 'ETH-ERC20',
          symbol: 'ETH-ERC20',
          decimals: 18,
          address: '0x123',
        }],
      }
    ));

    const balanceERC20Requirement: BalanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      delta: {
        balance: BigNumber.from(10),
        formattedBalance: '10',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigNumber.from(0),
        formattedBalance: '0',
        token: {
          name: 'ETH-ERC20',
          symbol: 'ETH-ERC20',
          decimals: 18,
          address: '0x123',
        },
      },
      required: {
        type: ItemType.ERC20,
        balance: BigNumber.from(10),
        formattedBalance: '10',
        token: {
          name: 'ETH-ERC20',
          symbol: 'ETH-ERC20',
          decimals: 18,
          address: '0x123',
        },
      },
    };

    const balanceRequirements = {
      sufficient: false,
      balanceRequirements: [balanceERC20Requirement],
    };

    const availableRoutingOptions = {
      onRamp: true,
      swap: true,
      bridge: true,
    };

    (getAllTokenBalances as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, []],
    ]));

    (bridgeRoute as jest.Mock).mockResolvedValue({
      type: FundingRouteType.BRIDGE,
      chainId: ChainId.SEPOLIA,
      asset: {
        balance: BigNumber.from(1),
        formattedBalance: '1',
        token: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
      },
    });

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, {} as JsonRpcProvider],
      [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
    ]));

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
    );
    expect(routingOptions)
      .toEqual({
        response: {
          type: RouteCalculatorType.ROUTES_FOUND,
          message: 'Routes found',
        },
        fundingRoutes: [{
          priority: 1,
          steps: [{
            type: FundingRouteType.BRIDGE,
            chainId: ChainId.SEPOLIA,
            asset: {
              balance: BigNumber.from(1),
              formattedBalance: '1',
              token: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          }],
        }],
      });
  });

  it('should return swap funding step', async () => {
    (allowListCheck as jest.Mock).mockImplementation(() => (
      {
        onRamp: [],
        swap: [
          {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
          {
            name: 'ERC20_2',
            symbol: 'ERC20_2',
            decimals: 18,
            address: '0xERC20_2',
          },
        ],
      }
    ));

    const balanceERC20Requirement = {
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

    const balanceRequirements = {
      sufficient: false,
      balanceRequirements: [balanceERC20Requirement],
    };

    const availableRoutingOptions = {
      onRamp: true,
      swap: true,
      bridge: true,
    };

    (getAllTokenBalances as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, []],
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
    ]));

    (bridgeRoute as jest.Mock).mockResolvedValue(undefined);

    (swapRoute as jest.Mock).mockResolvedValue({
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
    });

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, {} as JsonRpcProvider],
      [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
    ]));

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
    );
    expect(routingOptions)
      .toEqual({
        response: {
          type: RouteCalculatorType.ROUTES_FOUND,
          message: 'Routes found',
        },
        fundingRoutes: [{
          priority: 1,
          steps: [{
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
          }],
        }],
      });
  });

  it('should return onRamp funding step', async () => {
    (allowListCheck as jest.Mock).mockImplementation(() => (
      {
        onRamp: [{
          name: 'ERC20_1',
          symbol: 'ERC20_1',
          decimals: 18,
          address: '0xERC20_1',
        },
        {
          name: 'ERC20_2',
          symbol: 'ERC20_2',
          decimals: 18,
          address: '0xERC20_2',
        }],
        swap: [],
      }
    ));

    const balanceERC20Requirement = {
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

    const balanceRequirements = {
      sufficient: false,
      balanceRequirements: [balanceERC20Requirement],
    };

    const availableRoutingOptions = {
      onRamp: true,
      swap: false,
      bridge: false,
    };

    (getAllTokenBalances as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, []],
      [ChainId.IMTBL_ZKEVM_TESTNET, {
        success: true,
        balances: [
          {
            balance: BigNumber.from(10),
            formattedBalance: '10',
            token: {
              name: 'ERC20_2',
              symbol: 'ERC20_2',
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
    ]));

    (onRampRoute as jest.Mock).mockResolvedValue({
      type: FundingRouteType.ONRAMP,
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      asset: {
        balance: BigNumber.from(10),
        formattedBalance: '10',
        token: {
          name: 'ERC20_1',
          symbol: 'ERC20_1',
          decimals: 18,
          address: '0xERC20_1',
        },
      },
    });

    (swapRoute as jest.Mock).mockResolvedValue(undefined);

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, {} as JsonRpcProvider],
      [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
    ]));

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
    );
    expect(routingOptions)
      .toEqual({
        response: {
          type: RouteCalculatorType.ROUTES_FOUND,
          message: 'Routes found',
        },
        fundingRoutes: [{
          priority: 1,
          steps: [{
            type: FundingRouteType.ONRAMP,
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            asset: {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'ERC20_1',
                symbol: 'ERC20_1',
                decimals: 18,
                address: '0xERC20_1',
              },
            },
          }],
        }],
      });
  });

  it('should return bridge and swap funding step', async () => {
    (allowListCheck as jest.Mock).mockImplementation(() => (
      {
        onRamp: [],
        swap: [
          {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
          {
            name: 'ERC20_2',
            symbol: 'ERC20_2',
            decimals: 18,
            address: '0xERC20_2',
          },
        ],
      }
    ));

    const balanceERC20Requirement = {
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

    const balanceRequirements = {
      sufficient: false,
      balanceRequirements: [balanceERC20Requirement],
    };

    const availableRoutingOptions = {
      onRamp: false,
      swap: true,
      bridge: true,
    };

    (getAllTokenBalances as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, []],
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
    ]));

    (bridgeRoute as jest.Mock).mockResolvedValue({
      type: FundingRouteType.BRIDGE,
      chainId: ChainId.SEPOLIA,
      asset: {
        balance: BigNumber.from(1),
        formattedBalance: '1',
        token: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
      },
    });

    (swapRoute as jest.Mock).mockResolvedValue({
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
    });

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, {} as JsonRpcProvider],
      [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
    ]));

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
    );
    expect(routingOptions)
      .toEqual({
        response: {
          type: RouteCalculatorType.ROUTES_FOUND,
          message: 'Routes found',
        },
        fundingRoutes: [
          {
            priority: 1,
            steps: [{
              type: FundingRouteType.BRIDGE,
              chainId: ChainId.SEPOLIA,
              asset: {
                balance: BigNumber.from(1),
                formattedBalance: '1',
                token: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            }],
          },
          {
            priority: 2,
            steps: [{
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
            }],
          },
        ],
      });
  });

  it('should not recommend bridge or swap if multiple insufficient ERC20 requirements', async () => {
    const balanceERC20Requirement: BalanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      delta: {
        balance: BigNumber.from(10),
        formattedBalance: '10',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigNumber.from(0),
        formattedBalance: '0',
        token: {
          name: 'ETH-ERC20',
          symbol: 'ETH-ERC20',
          decimals: 18,
          address: '0x123',
        },
      },
      required: {
        type: ItemType.ERC20,
        balance: BigNumber.from(10),
        formattedBalance: '10',
        token: {
          name: 'ETH-ERC20',
          symbol: 'ETH-ERC20',
          decimals: 18,
          address: '0x123',
        },
      },
    };

    const balanceRequirements = {
      sufficient: true,
      balanceRequirements: [balanceERC20Requirement, balanceERC20Requirement],
    };

    const availableRoutingOptions = {
      onRamp: true,
      swap: true,
      bridge: true,
    };

    (getAllTokenBalances as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, []],
    ]));

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, {} as JsonRpcProvider],
      [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
    ]));

    (bridgeRoute as jest.Mock).mockResolvedValue({
      type: FundingRouteType.BRIDGE,
      chainId: 1,
      asset: {
        balance: BigNumber.from(1),
        formattedBalance: '1',
        token: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
      },
    });

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
    );
    expect(routingOptions)
      .toEqual({
        response: {
          type: RouteCalculatorType.NO_ROUTES,
          message: 'Routes not found',
        },
        fundingRoutes: [],
      });
  });

  it('should return no routes', async () => {
    const balanceRequirements = {
      sufficient: false,
      balanceRequirements: [],
    };

    const availableRoutingOptions = {
      onRamp: true,
      swap: true,
      bridge: true,
    };

    (getAllTokenBalances as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, []],
    ]));

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, {} as JsonRpcProvider],
      [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
    ]));

    (bridgeRoute as jest.Mock).mockResolvedValue(undefined);

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
    );
    expect(routingOptions)
      .toEqual({
        response: {
          type: RouteCalculatorType.NO_ROUTES,
          message: 'Routes not found',
        },
        fundingRoutes: [],
      });
  });

  it('should error if call to read only provider errors', async () => {
    const balanceERC20Requirement: BalanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      delta: {
        balance: BigNumber.from(10),
        formattedBalance: '10',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigNumber.from(0),
        formattedBalance: '0',
        token: {
          name: 'ETH-ERC20',
          symbol: 'ETH-ERC20',
          decimals: 18,
          address: '0x123',
        },
      },
      required: {
        type: ItemType.ERC20,
        balance: BigNumber.from(10),
        formattedBalance: '10',
        token: {
          name: 'ETH-ERC20',
          symbol: 'ETH-ERC20',
          decimals: 18,
          address: '0x123',
        },
      },
    };

    const balanceRequirements = {
      sufficient: true,
      balanceRequirements: [balanceERC20Requirement],
    };

    const availableRoutingOptions = {
      onRamp: true,
      swap: true,
      bridge: true,
    };

    (getAllTokenBalances as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, []],
    ]));

    (bridgeRoute as jest.Mock).mockResolvedValue({
      type: FundingRouteType.BRIDGE,
      chainId: 1,
      asset: {
        balance: BigNumber.from(1),
        formattedBalance: '1',
        token: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
      },
    });

    (createReadOnlyProviders as jest.Mock).mockRejectedValue(new Error('Error from create readonly providers'));

    let type;
    let data;

    try {
      await routingCalculator(
        config,

        '0x123',
        balanceRequirements,
        availableRoutingOptions,
      );
    } catch (err: any) {
      type = err.type;
      data = err.data;
    }

    expect(type).toEqual(CheckoutErrorType.PROVIDER_ERROR);
    expect(data).toEqual({ message: 'Error from create readonly providers' });
  });

  describe('getSwapFundingStep', () => {
    it('should recommend swap funding step', async () => {
      (swapRoute as jest.Mock).mockResolvedValue({
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
      });

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

      const swapFundingStep = await getSwapFundingStep(
        config,
        { swap: true },
        balanceRequirement,
        cache,
        '0xADDRESS',
        balances,
        [
          {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
          {
            name: 'ERC20_2',
            symbol: 'ERC20_2',
            decimals: 18,
            address: '0xERC20_2',
          },
        ],
      );

      expect(swapFundingStep).toEqual({
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
      });
    });

    it('should return undefined if the insufficient requirement is undefined', async () => {
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

      const swapFundingStep = await getSwapFundingStep(
        config,
        { swap: true },
        undefined,
        cache,
        '0xADDRESS',
        balances,
        [
          {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
          {
            name: 'ERC20_2',
            symbol: 'ERC20_2',
            decimals: 18,
            address: '0xERC20_2',
          },
        ],
      );

      expect(swapFundingStep).toBeUndefined();
    });

    it('should return undefined if no token balances for L2', async () => {
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

      const swapFundingStep = await getSwapFundingStep(
        config,
        { swap: true },
        balanceRequirement,
        cache,
        '0xADDRESS',
        balances,
        [
          {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
          {
            name: 'ERC20_2',
            symbol: 'ERC20_2',
            decimals: 18,
            address: '0xERC20_2',
          },
        ],
      );

      expect(swapFundingStep).toBeUndefined();
    });

    it('should return undefined if token balance result error', async () => {
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
          error: new CheckoutError('Error', CheckoutErrorType.GET_BALANCE_ERROR),
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

      const swapFundingStep = await getSwapFundingStep(
        config,
        { swap: true },
        balanceRequirement,
        cache,
        '0xADDRESS',
        balances,
        [
          {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
          {
            name: 'ERC20_2',
            symbol: 'ERC20_2',
            decimals: 18,
            address: '0xERC20_2',
          },
        ],
      );

      expect(swapFundingStep).toBeUndefined();
    });

    it('should return undefined if token balance result failed', async () => {
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
          success: false,
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

      const swapFundingStep = await getSwapFundingStep(
        config,
        { swap: true },
        balanceRequirement,
        cache,
        '0xADDRESS',
        balances,
        [
          {
            name: 'ERC20_1',
            symbol: 'ERC20_1',
            decimals: 18,
            address: '0xERC20_1',
          },
          {
            name: 'ERC20_2',
            symbol: 'ERC20_2',
            decimals: 18,
            address: '0xERC20_2',
          },
        ],
      );

      expect(swapFundingStep).toBeUndefined();
    });

    it('should return undefined if no swappable tokens', async () => {
      (swapRoute as jest.Mock).mockResolvedValue({
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
      });

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

      const swapFundingStep = await getSwapFundingStep(
        config,
        { swap: true },
        balanceRequirement,
        cache,
        '0xADDRESS',
        balances,
        [],
      );

      expect(swapFundingStep).toBeUndefined();
    });
  });
});

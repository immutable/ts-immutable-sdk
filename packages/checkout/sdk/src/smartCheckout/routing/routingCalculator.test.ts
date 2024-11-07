import { Environment } from '@imtbl/config';
import {
  getBridgeAndSwapFundingSteps,
  getSwapFundingSteps,
  routingCalculator,
} from './routingCalculator';
import { CheckoutConfiguration } from '../../config';
import { getAllTokenBalances } from './tokenBalances';
import { TokenBalanceResult } from './types';
import { bridgeRoute } from './bridge/bridgeRoute';
import {
  ChainId,
  FeeType,
  FundingStepType,
  ItemType,
  RoutingOutcomeType,
} from '../../types';
import {
  BalanceCheckResult,
  BalanceERC20Requirement,
  BalanceERC721Requirement,
  BalanceRequirement,
} from '../balanceCheck/types';
import { createReadOnlyProviders } from '../../readOnlyProviders/readOnlyProvider';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { swapRoute } from './swap/swapRoute';
import { allowListCheck } from '../allowList';
import { onRampRoute } from './onRamp';
import { bridgeAndSwapRoute } from './bridgeAndSwap/bridgeAndSwapRoute';
import { RoutingTokensAllowList } from '../allowList/types';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS } from './indexer/fetchL1Representation';
import { HttpClient } from '../../api/http';
import { formatUnits, JsonRpcProvider } from 'ethers';

jest.mock('./tokenBalances');
jest.mock('./bridge/bridgeRoute');
jest.mock('../../readOnlyProviders/readOnlyProvider');
jest.mock('../../config/remoteConfigFetcher');
jest.mock('./swap/swapRoute');
jest.mock('./onRamp/onRampRoute');
jest.mock('../allowList');
jest.mock('./bridgeAndSwap/bridgeAndSwapRoute');

describe('routingCalculator', () => {
  let config: CheckoutConfiguration;

  const readonlyProviders = new Map<ChainId, JsonRpcProvider>([
    [ChainId.SEPOLIA, {} as JsonRpcProvider],
    [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
  ]);

  beforeEach(() => {
    const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
    config = new CheckoutConfiguration(
      {
        baseConfig: { environment: Environment.SANDBOX },
      },
      mockedHttpClient,
    );
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('should invoke onFundingRoute callback with each found route', async () => {
    (allowListCheck as jest.Mock).mockImplementation(() => ({
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
    }));

    const balanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      delta: {
        balance: BigInt(1),
        formattedBalance: '1',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigInt(1),
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
        balance: BigInt(2),
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

    (getAllTokenBalances as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, []],
        [
          ChainId.IMTBL_ZKEVM_TESTNET,
          {
            success: true,
            balances: [
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20_2',
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                },
              },
            ],
          },
        ],
      ]),
    );

    (bridgeRoute as jest.Mock).mockResolvedValue(undefined);

    const swapFundingStep = {
      type: FundingStepType.SWAP,
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      fundingItem: {
        type: ItemType.ERC20,
        fundsRequired: {
          amount: BigInt(1),
          formattedAmount: formatUnits(BigInt(1), 18),
        },
        userBalance: {
          balance: BigInt(10),
          formattedBalance: '10',
        },
        token: {
          name: 'ERC20',
          symbol: 'ERC20',
          decimals: 18,
          address: '0xERC20_2',
        },
      },
    };
    (swapRoute as jest.Mock).mockResolvedValue([swapFundingStep]);

    const mockCallback = jest.fn();

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, {} as JsonRpcProvider],
        [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
      ]),
    );

    await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
      mockCallback,
    );
    expect(mockCallback).toHaveBeenCalledTimes(1);

    expect(mockCallback).toHaveBeenCalledWith({
      priority: 1,
      steps: [swapFundingStep],
    });
  });

  it('should not invoke onFundingRoute callback if no routes are found', async () => {
    const mockCallback = jest.fn();
    const availableRoutingOptions = {
      onRamp: false,
      swap: false,
      bridge: false,
    };
    const balanceRequirements = {} as BalanceCheckResult;

    await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
      mockCallback,
    );

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should return no options if no routing options are available', async () => {
    const availableRoutingOptions = {
      onRamp: false,
      swap: false,
      bridge: false,
    };

    const balanceRequirements = {} as BalanceCheckResult;
    (createReadOnlyProviders as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, {} as JsonRpcProvider],
        [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
      ]),
    );

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
      () => {},
    );
    expect(routingOptions).toEqual({
      type: RoutingOutcomeType.NO_ROUTE_OPTIONS,
      message: 'No routing options are available',
    });
  });

  it('should return no options if no routing options are defined', async () => {
    const availableRoutingOptions = {};
    const balanceRequirements = {} as BalanceCheckResult;
    (createReadOnlyProviders as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, {} as JsonRpcProvider],
        [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
      ]),
    );

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
      () => {},
    );
    expect(routingOptions).toEqual({
      type: RoutingOutcomeType.NO_ROUTE_OPTIONS,
      message: 'No routing options are available',
    });
  });

  it('should return bridge funding step', async () => {
    (allowListCheck as jest.Mock).mockImplementation(() => ({
      bridge: [
        {
          name: 'ETH-ERC20',
          symbol: 'ETH-ERC20',
          decimals: 18,
          address: '0x123',
        },
      ],
    }));

    const balanceERC20Requirement: BalanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      isFee: false,
      delta: {
        balance: BigInt(10),
        formattedBalance: '10',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigInt(0),
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
        balance: BigInt(10),
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

    (getAllTokenBalances as jest.Mock).mockResolvedValue(
      new Map([[ChainId.SEPOLIA, []]]),
    );

    const bridgeFundingStep = {
      type: FundingStepType.BRIDGE,
      chainId: ChainId.SEPOLIA,
      fundingItem: {
        type: ItemType.NATIVE,
        fundsRequired: {
          amount: BigInt(1),
          formattedAmount: '1',
        },
        userBalance: {
          balance: BigInt(1),
          formattedBalance: '1',
        },
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      },
      fees: {
        approvalGasFee: {
          type: FeeType.GAS,
          amount: BigInt(0),
          formattedAmount: '0',
        },
        bridgeGasFee: {
          type: FeeType.GAS,
          amount: BigInt(0),
          formattedAmount: '0',
        },
        bridgeFees: [
          {
            type: FeeType.BRIDGE_FEE,
            amount: BigInt(0),
            formattedAmount: '0',
          },
        ],
      },
    };
    (bridgeRoute as jest.Mock).mockResolvedValue(bridgeFundingStep);

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, {} as JsonRpcProvider],
        [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
      ]),
    );

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
      () => {},
    );

    expect(routingOptions).toEqual({
      type: RoutingOutcomeType.ROUTES_FOUND,
      fundingRoutes: [
        {
          priority: 2,
          steps: [bridgeFundingStep],
        },
      ],
    });
  });

  it('should return swap funding step', async () => {
    (allowListCheck as jest.Mock).mockImplementation(() => ({
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
    }));

    const balanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      delta: {
        balance: BigInt(1),
        formattedBalance: '1',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigInt(1),
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
        balance: BigInt(2),
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

    (getAllTokenBalances as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, []],
        [
          ChainId.IMTBL_ZKEVM_TESTNET,
          {
            success: true,
            balances: [
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20_2',
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                },
              },
            ],
          },
        ],
      ]),
    );

    (bridgeRoute as jest.Mock).mockResolvedValue(undefined);

    const swapFundingStep = {
      type: FundingStepType.SWAP,
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      fundingItem: {
        type: ItemType.ERC20,
        fundsRequired: {
          amount: BigInt(1),
          formattedAmount: formatUnits(BigInt(1), 18),
        },
        userBalance: {
          balance: BigInt(10),
          formattedBalance: '10',
        },
        token: {
          name: 'ERC20',
          symbol: 'ERC20',
          decimals: 18,
          address: '0xERC20_2',
        },
      },
    };
    (swapRoute as jest.Mock).mockResolvedValue([swapFundingStep]);

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, {} as JsonRpcProvider],
        [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
      ]),
    );

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
      () => {},
    );
    expect(routingOptions).toEqual({
      type: RoutingOutcomeType.ROUTES_FOUND,
      fundingRoutes: [
        {
          priority: 1,
          steps: [swapFundingStep],
        },
      ],
    });
  });

  it('should return multiple swap funding steps', async () => {
    (allowListCheck as jest.Mock).mockImplementation(() => ({
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
        {
          name: 'ERC20_3',
          symbol: 'ERC20_3',
          decimals: 18,
          address: '0xERC20_3',
        },
      ],
    }));

    const balanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      delta: {
        balance: BigInt(1),
        formattedBalance: '1',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigInt(1),
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
        balance: BigInt(2),
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

    (getAllTokenBalances as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, []],
        [
          ChainId.IMTBL_ZKEVM_TESTNET,
          {
            success: true,
            balances: [
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20_2',
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20_3',
                  symbol: 'ERC20_3',
                  decimals: 18,
                  address: '0xERC20_3',
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                },
              },
            ],
          },
        ],
      ]),
    );

    (bridgeRoute as jest.Mock).mockResolvedValue(undefined);

    const swapFundingStep1 = {
      type: FundingStepType.SWAP,
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      fundingItem: {
        type: ItemType.ERC20,
        fundsRequired: {
          amount: BigInt(1),
          formattedAmount: formatUnits(BigInt(1), 18),
        },
        userBalance: {
          balance: BigInt(10),
          formattedBalance: '10',
        },
        token: {
          name: 'ERC20',
          symbol: 'ERC20',
          decimals: 18,
          address: '0xERC20_2',
        },
      },
    };

    const swapFundingStep2 = {
      type: FundingStepType.SWAP,
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      fundingItem: {
        type: ItemType.ERC20,
        fundsRequired: {
          amount: BigInt(1),
          formattedAmount: formatUnits(BigInt(1), 18),
        },
        userBalance: {
          balance: BigInt(10),
          formattedBalance: '10',
        },
        token: {
          name: 'ERC20_3',
          symbol: 'ERC20_3',
          decimals: 18,
          address: '0xERC20_3',
        },
      },
    };

    (swapRoute as jest.Mock).mockResolvedValue([
      swapFundingStep1,
      swapFundingStep2,
    ]);

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, {} as JsonRpcProvider],
        [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
      ]),
    );

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
      () => {},
    );
    expect(routingOptions).toEqual({
      type: RoutingOutcomeType.ROUTES_FOUND,
      fundingRoutes: [
        {
          priority: 1,
          steps: [swapFundingStep1],
        },
        {
          priority: 1,
          steps: [swapFundingStep2],
        },
      ],
    });
  });

  it('should return onRamp funding step', async () => {
    (allowListCheck as jest.Mock).mockImplementation(() => ({
      onRamp: [
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
      swap: [],
    }));

    const balanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      delta: {
        balance: BigInt(1),
        formattedBalance: '1',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigInt(1),
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
        balance: BigInt(2),
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

    (getAllTokenBalances as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, []],
        [
          ChainId.IMTBL_ZKEVM_TESTNET,
          {
            success: true,
            balances: [
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20_2',
                  symbol: 'ERC20_2',
                  decimals: 18,
                  address: '0xERC20_2',
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                },
              },
            ],
          },
        ],
      ]),
    );

    const onRampFundingStep = {
      type: FundingStepType.ONRAMP,
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      asset: {
        fundsRequired: {
          amount: BigInt(10),
          formattedAmount: '10',
        },
        userBalance: {
          balance: BigInt(0),
          formattedBalance: '0',
        },
        token: {
          name: 'ERC20_1',
          symbol: 'ERC20_1',
          decimals: 18,
          address: '0xERC20_1',
        },
      },
    };
    (onRampRoute as jest.Mock).mockResolvedValue(onRampFundingStep);

    (swapRoute as jest.Mock).mockResolvedValue(undefined);

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, {} as JsonRpcProvider],
        [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
      ]),
    );

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
      () => {},
    );
    expect(routingOptions).toEqual({
      type: RoutingOutcomeType.ROUTES_FOUND,
      fundingRoutes: [
        {
          priority: 3,
          steps: [onRampFundingStep],
        },
      ],
    });
  });

  it('should return bridge, swap and bridge & swap funding step', async () => {
    (allowListCheck as jest.Mock).mockImplementation(() => ({
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
    }));

    const balanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      delta: {
        balance: BigInt(1),
        formattedBalance: '1',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigInt(1),
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
        balance: BigInt(2),
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

    (getAllTokenBalances as jest.Mock).mockResolvedValue(
      new Map([
        [
          ChainId.SEPOLIA,
          {
            success: true,
            balances: [
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                  address: '0xIMX',
                },
              },
            ],
          },
        ],
        [
          ChainId.IMTBL_ZKEVM_TESTNET,
          {
            success: true,
            balances: [
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20_2',
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                },
              },
            ],
          },
        ],
      ]),
    );

    const bridgeFundingStep = {
      type: FundingStepType.BRIDGE,
      chainId: ChainId.SEPOLIA,
      fundingItem: {
        type: ItemType.NATIVE,
        fundsRequired: {
          amount: BigInt(1),
          formattedAmount: '1',
        },
        userBalance: {
          balance: BigInt(1),
          formattedBalance: '1',
        },
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      },
      fees: {
        approvalGasFee: {
          type: FeeType.GAS,
          amount: BigInt(0),
          formattedAmount: '0',
        },
        bridgeGasFee: {
          type: FeeType.GAS,
          amount: BigInt(0),
          formattedAmount: '0',
        },
        bridgeFees: [
          {
            type: FeeType.BRIDGE_FEE,
            amount: BigInt(0),
            formattedAmount: '0',
          },
        ],
      },
    };
    (bridgeRoute as jest.Mock).mockResolvedValue(bridgeFundingStep);

    const swapFundingStep = {
      type: FundingStepType.SWAP,
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      fundingItem: {
        type: ItemType.ERC20,
        fundsRequired: {
          amount: BigInt(1),
          formattedAmount: formatUnits(BigInt(1), 18),
        },
        userBalance: {
          balance: BigInt(10),
          formattedBalance: '10',
        },
        token: {
          name: 'ERC20',
          symbol: 'ERC20',
          decimals: 18,
          address: '0xERC20_2',
        },
      },
    };
    (swapRoute as jest.Mock).mockResolvedValue([swapFundingStep]);

    const bridgeImxFundingStep = {
      type: FundingStepType.BRIDGE,
      chainId: ChainId.SEPOLIA,
      fundingItem: {
        type: ItemType.ERC20,
        fundsRequired: {
          amount: BigInt(1),
          formattedAmount: formatUnits(BigInt(1), 18),
        },
        userBalance: {
          balance: BigInt(5),
          formattedBalance: '5',
        },
        token: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
          address: '0xIMXL1',
        },
      },
    };
    const swapImxFundingStep = {
      type: FundingStepType.SWAP,
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      fundingItem: {
        type: ItemType.ERC20,
        fundsRequired: {
          amount: BigInt(1),
          formattedAmount: formatUnits(BigInt(1), 18),
        },
        userBalance: {
          balance: BigInt(10),
          formattedBalance: '10',
        },
        token: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
          address: '0xIMX',
        },
      },
    };
    (bridgeAndSwapRoute as jest.Mock).mockResolvedValue([
      {
        bridgeFundingStep: bridgeImxFundingStep,
        swapFundingStep: swapImxFundingStep,
      },
    ]);

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, {} as JsonRpcProvider],
        [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
      ]),
    );

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
      () => {},
    );
    expect(routingOptions).toEqual({
      type: RoutingOutcomeType.ROUTES_FOUND,
      fundingRoutes: [
        {
          priority: 1,
          steps: [swapFundingStep],
        },
        {
          priority: 2,
          steps: [bridgeFundingStep],
        },
        {
          priority: 4,
          steps: [bridgeImxFundingStep, swapImxFundingStep],
        },
      ],
    });
  });

  it('should not recommend bridge or swap if multiple insufficient ERC20 requirements', async () => {
    const balanceERC20Requirement: BalanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      isFee: false,
      delta: {
        balance: BigInt(10),
        formattedBalance: '10',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigInt(0),
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
        balance: BigInt(10),
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

    (allowListCheck as jest.Mock).mockResolvedValue(availableRoutingOptions);

    (getAllTokenBalances as jest.Mock).mockResolvedValue(
      new Map([[ChainId.SEPOLIA, []]]),
    );

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, {} as JsonRpcProvider],
        [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
      ]),
    );

    (bridgeRoute as jest.Mock).mockResolvedValue({
      type: FundingStepType.BRIDGE,
      chainId: 1,
      asset: {
        balance: BigInt(1),
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
      () => {},
    );
    expect(routingOptions).toEqual({
      type: RoutingOutcomeType.NO_ROUTES_FOUND,
      message:
        'Smart Checkout did not find any funding routes to fulfill the transaction',
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

    (allowListCheck as jest.Mock).mockResolvedValue(availableRoutingOptions);

    (getAllTokenBalances as jest.Mock).mockResolvedValue(
      new Map([[ChainId.SEPOLIA, []]]),
    );

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(
      new Map([
        [ChainId.SEPOLIA, {} as JsonRpcProvider],
        [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
      ]),
    );

    (bridgeRoute as jest.Mock).mockResolvedValue(undefined);

    const routingOptions = await routingCalculator(
      config,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
      () => {},
    );
    expect(routingOptions).toEqual({
      type: RoutingOutcomeType.NO_ROUTES_FOUND,
      message:
        'Smart Checkout did not find any funding routes to fulfill the transaction',
    });
  });

  it('should error if call to read only provider errors', async () => {
    const balanceERC20Requirement: BalanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      isFee: false,
      delta: {
        balance: BigInt(10),
        formattedBalance: '10',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigInt(0),
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
        balance: BigInt(10),
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

    (getAllTokenBalances as jest.Mock).mockResolvedValue(
      new Map([[ChainId.SEPOLIA, []]]),
    );

    (bridgeRoute as jest.Mock).mockResolvedValue({
      type: FundingStepType.BRIDGE,
      chainId: 1,
      asset: {
        balance: BigInt(1),
        formattedBalance: '1',
        token: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
      },
    });

    (createReadOnlyProviders as jest.Mock).mockRejectedValue(
      new Error('Error from create readonly providers'),
    );

    let type;
    let data;

    try {
      await routingCalculator(
        config,
        '0x123',
        balanceRequirements,
        availableRoutingOptions,
        () => {},
      );
    } catch (err: any) {
      type = err.type;
      data = err.data;
    }

    expect(type).toEqual(CheckoutErrorType.PROVIDER_ERROR);
    expect(data.error).toBeDefined();
  });

  describe('getSwapFundingStep', () => {
    it('should recommend swap funding step', async () => {
      const swapFundingStep = {
        type: FundingStepType.SWAP,
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        fundingItem: {
          type: ItemType.ERC20,
          fundsRequired: {
            amount: BigInt(1),
            formattedAmount: formatUnits(BigInt(1), 18),
          },
          userBalance: {
            balance: BigInt(10),
            formattedBalance: '10',
          },
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20_2',
          },
        },
      };
      (swapRoute as jest.Mock).mockResolvedValue([swapFundingStep]);

      const balanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigInt(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigInt(1),
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
          balance: BigInt(2),
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
        [
          ChainId.IMTBL_ZKEVM_TESTNET,
          {
            success: true,
            balances: [
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20_2',
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                },
              },
            ],
          },
        ],
      ]);

      const swapFundingSteps = await getSwapFundingSteps(
        config,
        { swap: true },
        balanceRequirement,
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
        {
          sufficient: false,
          balanceRequirements: [balanceRequirement],
        },
      );

      expect(swapFundingSteps).toEqual([swapFundingStep]);
    });

    it('should return empty array if the insufficient requirement is undefined', async () => {
      const balances = new Map<ChainId, TokenBalanceResult>([
        [
          ChainId.IMTBL_ZKEVM_TESTNET,
          {
            success: true,
            balances: [
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20_2',
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                },
              },
            ],
          },
        ],
      ]);

      const swapFundingSteps = await getSwapFundingSteps(
        config,
        { swap: true },
        undefined,
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
        {
          sufficient: false,
          balanceRequirements: [],
        },
      );

      expect(swapFundingSteps).toEqual([]);
    });

    it('should return empty array if no token balances for L2', async () => {
      const balanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigInt(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigInt(1),
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
          balance: BigInt(2),
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
        [
          ChainId.SEPOLIA,
          {
            success: true,
            balances: [
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20_2',
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                },
              },
            ],
          },
        ],
      ]);

      const swapFundingSteps = await getSwapFundingSteps(
        config,
        { swap: true },
        balanceRequirement,
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
        {
          sufficient: false,
          balanceRequirements: [balanceRequirement],
        },
      );

      expect(swapFundingSteps).toEqual([]);
    });

    it('should return empty array if token balance result error', async () => {
      const balanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigInt(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigInt(1),
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
          balance: BigInt(2),
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
        [
          ChainId.IMTBL_ZKEVM_TESTNET,
          {
            error: new CheckoutError(
              'Error',
              CheckoutErrorType.GET_BALANCE_ERROR,
            ),
            success: true,
            balances: [
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20_2',
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                },
              },
            ],
          },
        ],
      ]);

      const swapFundingSteps = await getSwapFundingSteps(
        config,
        { swap: true },
        balanceRequirement,
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
        {
          sufficient: false,
          balanceRequirements: [balanceRequirement],
        },
      );

      expect(swapFundingSteps).toEqual([]);
    });

    it('should return empty array if token balance result failed', async () => {
      const balanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigInt(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigInt(1),
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
          balance: BigInt(2),
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
        [
          ChainId.IMTBL_ZKEVM_TESTNET,
          {
            success: false,
            balances: [
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20_2',
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                },
              },
            ],
          },
        ],
      ]);

      const swapFundingSteps = await getSwapFundingSteps(
        config,
        { swap: true },
        balanceRequirement,
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
        {
          sufficient: false,
          balanceRequirements: [balanceRequirement],
        },
      );

      expect(swapFundingSteps).toEqual([]);
    });

    it('should return empty array if no swappable tokens', async () => {
      (swapRoute as jest.Mock).mockResolvedValue({
        type: FundingStepType.SWAP,
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        asset: {
          balance: BigInt(10),
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
          balance: BigInt(1),
          formattedBalance: '1',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigInt(1),
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
          balance: BigInt(2),
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
        [
          ChainId.IMTBL_ZKEVM_TESTNET,
          {
            success: true,
            balances: [
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'ERC20',
                  symbol: 'ERC20',
                  decimals: 18,
                  address: '0xERC20_2',
                },
              },
              {
                balance: BigInt(10),
                formattedBalance: '10',
                token: {
                  name: 'IMX',
                  symbol: 'IMX',
                  decimals: 18,
                },
              },
            ],
          },
        ],
      ]);

      const swapFundingSteps = await getSwapFundingSteps(
        config,
        { swap: true },
        balanceRequirement,
        '0xADDRESS',
        balances,
        [],
        {
          sufficient: false,
          balanceRequirements: [balanceRequirement],
        },
      );

      expect(swapFundingSteps).toEqual([]);
    });
  });

  describe('getBridgeAndSwapFundingSteps', () => {
    const insufficientRequirement = {
      type: ItemType.NATIVE,
      sufficient: false,
      delta: {
        balance: BigInt(5),
        formattedBalance: '5',
      },
      current: {
        type: ItemType.NATIVE,
        balance: BigInt(5),
        formattedBalance: '5',
        token: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
          address: '0xIMX',
        },
      },
      required: {
        type: ItemType.NATIVE,
        balance: BigInt(10),
        formattedBalance: '10',
        token: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: 18,
          address: '0xIMX',
        },
      },
    } as BalanceRequirement;
    const tokenBalances = new Map<ChainId, TokenBalanceResult>([]);
    const l1balances = {
      success: true,
      balances: [
        {
          balance: BigInt(10),
          formattedBalance: '10',
          token: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        },
        {
          balance: BigInt(10),
          formattedBalance: '10',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xIMX',
          },
        },
      ],
    };
    const l2balances = {
      success: true,
      balances: [
        {
          balance: BigInt(10),
          formattedBalance: '10',
          token: {
            name: 'ERC20',
            symbol: 'ERC20',
            decimals: 18,
            address: '0xERC20_2',
          },
        },
        {
          balance: BigInt(10),
          formattedBalance: '10',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      ],
    };
    const tokenAllowList: RoutingTokensAllowList = {
      bridge: [
        {
          name: 'ERC20_1',
          symbol: 'ERC20_1',
          decimals: 18,
          address: '0xERC20_1',
        },
        {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
      ],
      swap: [
        {
          name: 'ERC20_2',
          symbol: 'ERC20_2',
          decimals: 18,
          address: '0xERC20_2',
        },
      ],
    };

    const balanceRequirements: BalanceCheckResult = {
      sufficient: false,
      balanceRequirements: [insufficientRequirement],
    };

    it('should not get bridge and swap funding step if insufficient requirement undefined', async () => {
      const result = await getBridgeAndSwapFundingSteps(
        config,
        readonlyProviders,
        { swap: true, bridge: true },
        undefined,
        '0xADDRESS',
        tokenBalances,
        tokenAllowList,
        balanceRequirements,
      );
      expect(result).toEqual([]);
    });

    it('should not get bridge and swap funding step if no l1 balances', async () => {
      const result = await getBridgeAndSwapFundingSteps(
        config,
        readonlyProviders,
        { swap: true, bridge: true },
        insufficientRequirement,
        '0xADDRESS',
        tokenBalances,
        tokenAllowList,
        balanceRequirements,
      );
      expect(result).toEqual([]);
    });

    it('should not get bridge and swap funding step if l1 balances error', async () => {
      tokenBalances.set(ChainId.SEPOLIA, {
        success: true,
        error: new CheckoutError('error', CheckoutErrorType.GET_BALANCE_ERROR),
        balances: [],
      });
      const result = await getBridgeAndSwapFundingSteps(
        config,
        readonlyProviders,
        { swap: true, bridge: true },
        insufficientRequirement,
        '0xADDRESS',
        tokenBalances,
        tokenAllowList,
        balanceRequirements,
      );
      expect(result).toEqual([]);
    });

    it('should not get bridge and swap funding step if l1 balances success false', async () => {
      tokenBalances.set(ChainId.SEPOLIA, {
        success: false,
        balances: [],
      });
      const result = await getBridgeAndSwapFundingSteps(
        config,
        readonlyProviders,
        { swap: true, bridge: true },
        insufficientRequirement,
        '0xADDRESS',
        tokenBalances,
        tokenAllowList,
        balanceRequirements,
      );
      expect(result).toEqual([]);
    });

    it('should not get bridge and swap funding step if no l2 balances', async () => {
      tokenBalances.set(ChainId.SEPOLIA, l1balances);
      const result = await getBridgeAndSwapFundingSteps(
        config,
        readonlyProviders,
        { swap: true, bridge: true },
        insufficientRequirement,
        '0xADDRESS',
        tokenBalances,
        tokenAllowList,
        balanceRequirements,
      );
      expect(result).toEqual([]);
    });

    it('should not get bridge and swap funding step if l2 balances error', async () => {
      tokenBalances.set(ChainId.SEPOLIA, l1balances);
      tokenBalances.set(ChainId.IMTBL_ZKEVM_TESTNET, {
        success: true,
        error: new CheckoutError('error', CheckoutErrorType.GET_BALANCE_ERROR),
        balances: [],
      });
      const result = await getBridgeAndSwapFundingSteps(
        config,
        readonlyProviders,
        { swap: true, bridge: true },
        insufficientRequirement,
        '0xADDRESS',
        tokenBalances,
        tokenAllowList,
        balanceRequirements,
      );
      expect(result).toEqual([]);
    });

    it('should not get bridge and swap funding step if l2 balances success false', async () => {
      tokenBalances.set(ChainId.SEPOLIA, l1balances);
      tokenBalances.set(ChainId.IMTBL_ZKEVM_TESTNET, {
        success: false,
        balances: [],
      });
      const result = await getBridgeAndSwapFundingSteps(
        config,
        readonlyProviders,
        { swap: true, bridge: true },
        insufficientRequirement,
        '0xADDRESS',
        tokenBalances,
        tokenAllowList,
        balanceRequirements,
      );
      expect(result).toEqual([]);
    });

    it('should not get bridge and swap funding step if item requirement erc721', async () => {
      tokenBalances.set(ChainId.SEPOLIA, l1balances);
      tokenBalances.set(ChainId.IMTBL_ZKEVM_TESTNET, l2balances);
      const result = await getBridgeAndSwapFundingSteps(
        config,
        readonlyProviders,
        { swap: true, bridge: true },
        {
          type: ItemType.ERC721,
        } as BalanceERC721Requirement,
        '0xADDRESS',
        tokenBalances,
        tokenAllowList,
        balanceRequirements,
      );
      expect(result).toEqual([]);
    });

    it('should call bridgeAndSwapRoute and return routes', async () => {
      const bridgeFundingStep = {
        type: FundingStepType.BRIDGE,
        chainId: ChainId.SEPOLIA,
        fundingItem: {
          type: ItemType.ERC20,
          fundsRequired: {
            amount: BigInt(1),
            formattedAmount: formatUnits(BigInt(1), 18),
          },
          userBalance: {
            balance: BigInt(5),
            formattedBalance: '5',
          },
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xIMXL1',
          },
        },
      };
      const swapFundingStep = {
        type: FundingStepType.SWAP,
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        fundingItem: {
          type: ItemType.ERC20,
          fundsRequired: {
            amount: BigInt(1),
            formattedAmount: formatUnits(BigInt(1), 18),
          },
          userBalance: {
            balance: BigInt(10),
            formattedBalance: '10',
          },
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xIMX',
          },
        },
      };
      (bridgeAndSwapRoute as jest.Mock).mockResolvedValue([
        {
          bridgeFundingStep,
          swapFundingStep,
        },
      ]);

      tokenBalances.set(ChainId.SEPOLIA, l1balances);
      tokenBalances.set(ChainId.IMTBL_ZKEVM_TESTNET, l2balances);
      const result = await getBridgeAndSwapFundingSteps(
        config,
        readonlyProviders,
        { swap: true, bridge: true },
        insufficientRequirement,
        '0xADDRESS',
        tokenBalances,
        tokenAllowList,
        balanceRequirements,
      );
      expect(result).toEqual([
        {
          bridgeFundingStep,
          swapFundingStep,
        },
      ]);
      expect(bridgeAndSwapRoute).toBeCalledWith(
        config,
        readonlyProviders,
        { bridge: true, swap: true },
        insufficientRequirement,
        '0xADDRESS',
        tokenBalances,
        ['0xERC20_1', INDEXER_ETH_ROOT_CONTRACT_ADDRESS],
        [
          {
            address: '0xERC20_2',
            decimals: 18,
            name: 'ERC20_2',
            symbol: 'ERC20_2',
          },
        ],
        balanceRequirements,
      );
    });
  });
});

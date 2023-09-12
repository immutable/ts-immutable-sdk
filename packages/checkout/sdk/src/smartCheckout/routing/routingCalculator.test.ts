import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { routingCalculator } from './routingCalculator';
import { CheckoutConfiguration } from '../../config';
import { getAllTokenBalances } from './tokenBalances';
import { FundingRouteType, RouteCalculatorType } from './types';
import { bridgeRoute } from './bridge/bridgeRoute';
import { ChainId, ItemType } from '../../types';
import { BalanceERC20Requirement } from '../balanceCheck/types';
import { createReadOnlyProviders } from '../../readOnlyProviders/readOnlyProvider';
import { CheckoutErrorType } from '../../errors';

jest.mock('./tokenBalances');
jest.mock('./bridge/bridgeRoute');
jest.mock('../../readOnlyProviders/readOnlyProvider');

describe('routingCalculator', () => {
  let config: CheckoutConfiguration;
  let providerMock: Web3Provider;

  beforeEach(() => {
    config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    });

    providerMock = {} as unknown as Web3Provider;
  });

  it('should return routes', async () => {
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

    (createReadOnlyProviders as jest.Mock).mockResolvedValue(new Map([
      [ChainId.SEPOLIA, {} as JsonRpcProvider],
      [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
    ]));

    const routingOptions = await routingCalculator(
      config,
      providerMock,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
    );
    expect(routingOptions)
      .toEqual({
        availableOptions: [],
        response: {
          type: 'ROUTES_FOUND',
          message: 'Routes found',
        },
        fundingRoutes: [{
          priority: 1,
          steps: [{
            type: 'bridge',
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
          }],
        }],
      });
  });

  it('should not recommend bridge if multiple insufficient ERC20 requirements', async () => {
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
      providerMock,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
    );
    expect(routingOptions)
      .toEqual({
        availableOptions: [],
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
      providerMock,
      '0x123',
      balanceRequirements,
      availableRoutingOptions,
    );
    expect(routingOptions)
      .toEqual({
        availableOptions: [],
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
        providerMock,
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
});

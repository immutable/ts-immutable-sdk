import { BigNumber } from 'ethers';
import { RoutingOptionsAvailable } from '../../types';
import { BalanceCheckResult } from '../balanceCheck/types';
import { RoutingCalculatorResult } from './types';
import { CheckoutConfiguration } from '../../config';
import { getAllTokenBalances } from './tokenBalances';

export const routingCalculator = async (
  config: CheckoutConfiguration,
  ownerAddress: string,
  balanceRequirements: BalanceCheckResult,
  availableRoutingOptions: RoutingOptionsAvailable,
): Promise<RoutingCalculatorResult> => {
  // eslint-disable-next-line no-console

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tokenBalances = await getAllTokenBalances(config, ownerAddress, availableRoutingOptions);

  // Get allowed tokens?

  // Check bridging routes

  // Check on-ramp routes

  // Check swap routes
  // > Could bridge first
  // > Could on-ramp first
  // > Could double swap

  return {
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
          balance: BigNumber.from(0),
          formattedBalance: '0',
          token: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      }],
    }],
  };
};

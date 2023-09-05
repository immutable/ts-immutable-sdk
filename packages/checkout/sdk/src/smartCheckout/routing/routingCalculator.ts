import { BigNumber } from 'ethers';
import { RoutingOptionsAvailable } from '../../types';
import { BalanceCheckResult } from '../balanceCheck/types';
import { RoutingCalculatorResult } from './types';

export const routingCalculator = async (
  balanceRequirements: BalanceCheckResult,
  availableRoutingOptions: RoutingOptionsAvailable,
): Promise<RoutingCalculatorResult> => {
  // eslint-disable-next-line no-console
  console.log('routingCalculator', availableRoutingOptions, balanceRequirements);
  // Get native & token balances on L1 & L2

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

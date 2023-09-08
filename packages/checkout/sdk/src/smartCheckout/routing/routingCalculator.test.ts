import { BigNumber } from 'ethers';
import { routingCalculator } from './routingCalculator';

describe('routingCalculator', () => {
  it('should return routes', async () => {
    const balanceRequirements = {
      sufficient: true,
      balanceRequirements: [],
    };
    const availableRoutingOptions = {
      onRamp: true,
      swap: true,
      bridge: true,
    };

    const routingOptions = await routingCalculator(balanceRequirements, availableRoutingOptions);
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
      });
  });
});

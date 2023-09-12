import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { routingCalculator } from './routingCalculator';
import { CheckoutConfiguration } from '../../config';
import { getAllTokenBalances } from './tokenBalances';

jest.mock('./tokenBalances');

describe('routingCalculator', () => {
  let config: CheckoutConfiguration;

  beforeEach(() => {
    config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    });
  });

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
    (getAllTokenBalances as jest.Mock).mockResolvedValue(new Map([
      [1, []],
    ]));

    const routingOptions = await routingCalculator(config, '0x123', balanceRequirements, availableRoutingOptions);
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

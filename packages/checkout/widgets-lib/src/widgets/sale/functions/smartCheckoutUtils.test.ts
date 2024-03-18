/* eslint-disable @typescript-eslint/naming-convention */
import { Web3Provider } from '@ethersproject/providers';
import {
  FundingRoute,
  FundingStepType,
  ItemType,
  RoutingOutcomeType,
  SmartCheckoutInsufficient,
  SmartCheckoutResult,
  SmartCheckoutSufficient,
} from '@imtbl/checkout-sdk';
import {
  filterSmartCheckoutResult,
  fundingRouteFees,
  getFractionalBalance,
  smartCheckoutTokensList,
} from './smartCheckoutUtils';

describe('getFractionalBalance', () => {
  it('should return map insufficient balances', async () => {
    const insufficientSmartCheckoutResult = {
      sufficient: false,
      transactionRequirements: [
        {
          sufficient: false,
          type: ItemType.NATIVE,
        },
        {
          sufficient: true,
          type: ItemType.ERC20,
        },
      ],
      router: {},
    } as unknown as SmartCheckoutResult;

    const fractionalBalance = getFractionalBalance(insufficientSmartCheckoutResult);
    expect(fractionalBalance).toEqual({
      [ItemType.NATIVE]: false,
      [ItemType.ERC20]: true,
    });
  });
});

describe('fundingRouteFees', () => {
  const ethFee = {
    formattedAmount: '1',
    token: {
      symbol: 'ETH',
    },
  };

  const imxFee = {
    formattedAmount: '1',
    token: {
      symbol: 'IMX',
    },
  };

  const conversions = new Map<string, number>([
    ['eth', 100],
    ['imx', 10],
  ]);

  it('should aggregate fees for Bridge', () => {
    const fundingRoute: FundingRoute = {
      steps: [
        {
          type: FundingStepType.BRIDGE,
          fees: {
            approvalGasFee: ethFee,
            bridgeFees: [ethFee, ethFee],
            bridgeGasFee: ethFee,
          },
        },
      ],
    } as unknown as FundingRoute;

    const totalFees = fundingRouteFees(fundingRoute, conversions);

    expect(totalFees).toEqual('400.00');
  });

  it('should aggregate fees for Swap', () => {
    const fundingRoute: FundingRoute = {
      steps: [
        {
          type: FundingStepType.SWAP,
          fees: {
            approvalGasFee: imxFee,
            swapFees: [imxFee, imxFee],
            swapGasFee: imxFee,
          },
        },
      ],
    } as unknown as FundingRoute;

    const totalFees = fundingRouteFees(fundingRoute, conversions);

    expect(totalFees).toEqual('40.00');
  });

  it('should aggregate fees for Swap and Bridge', () => {
    const fundingRoute: FundingRoute = {
      steps: [
        {
          type: FundingStepType.BRIDGE,
          fees: {
            approvalGasFee: ethFee,
            bridgeFees: [ethFee, ethFee],
            bridgeGasFee: ethFee,
          },
        },
        {
          type: FundingStepType.SWAP,
          fees: {
            approvalGasFee: imxFee,
            swapFees: [imxFee, imxFee],
            swapGasFee: imxFee,
          },
        },
      ],
    } as unknown as FundingRoute;

    const totalFees = fundingRouteFees(fundingRoute, conversions);

    expect(totalFees).toEqual('440.00');
  });
});

describe('smartCheckoutTokensList', () => {
  it('should aggregate all unique tokens within fundingRoutes', () => {
    const smartCheckoutResult: SmartCheckoutResult = {
      transactionRequirements: [
        {
          current: {
            token: {
              symbol: 'IMX',
            },
          },
        },
        {
          current: {
            token: {
              symbol: 'zkTKN',
            },
          },
        },
      ],
      router: {
        routingOutcome: {
          type: RoutingOutcomeType.ROUTES_FOUND,
          fundingRoutes: [
            {
              priority: 1,
              steps: [
                {
                  type: 'SWAP',
                  fundingItem: {
                    token: {
                      symbol: 'IMX',
                    },
                  },
                },
              ],
            },
            {
              priority: 1,
              steps: [
                {
                  type: 'SWAP',
                  fundingItem: {
                    token: {
                      symbol: 'ETH',
                    },
                  },
                },
              ],
            },
            {
              priority: 1,
              steps: [
                {
                  type: 'BRIDGE',
                  fundingItem: {
                    token: {
                      symbol: 'ETH',
                    },
                  },
                },
                {
                  type: 'SWAP',
                  fundingItem: {
                    token: {
                      symbol: 'zkTKN',
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    } as unknown as SmartCheckoutResult;

    const tokens = smartCheckoutTokensList(smartCheckoutResult);
    expect(tokens).toEqual(['IMX', 'zkTKN', 'ETH']);
  });

  describe('filterSmartCheckoutResult', () => {
    it('should not filter sufficient results', () => {
      const sufficentSmartCheckoutResult = {
        sufficient: true,
        transactionRequirements: [],
        router: {
          routingOutcome: {
            type: RoutingOutcomeType.NO_ROUTES_FOUND,
            fundingRoutes: [],
          },
        },
      } as unknown as SmartCheckoutSufficient;

      const filteredSmartCheckoutResult = filterSmartCheckoutResult(
        sufficentSmartCheckoutResult,
      );

      expect(filteredSmartCheckoutResult).toEqual(sufficentSmartCheckoutResult);
    });

    it('should not filter insufficient results if no funding routes were found', () => {
      const insufficientSmartCheckoutResult = {
        sufficient: false,
        transactionRequirements: [],
        router: {
          routingOutcome: {
            type: RoutingOutcomeType.NO_ROUTES_FOUND,
            fundingRoutes: [],
          },
        },
      } as unknown as SmartCheckoutInsufficient;

      const filteredSmartCheckoutResult = filterSmartCheckoutResult(
        insufficientSmartCheckoutResult,
      );

      expect(filteredSmartCheckoutResult).toEqual(
        insufficientSmartCheckoutResult,
      );
    });

    it('should have sufficent NATIVE token requirement if wallet is passport', () => {
      const insufficientSmartCheckoutResult = {
        sufficient: false,
        transactionRequirements: [
          {
            sufficient: false,
            type: ItemType.NATIVE,
          },
          {
            sufficient: true,
            type: ItemType.ERC20,
          },
        ],
        router: {
          routingOutcome: {
            type: RoutingOutcomeType.ROUTES_FOUND,
            fundingRoutes: [
              {
                priority: 1,
                steps: [
                  {
                    type: FundingStepType.ONRAMP,
                    fundingItem: {
                      type: ItemType.NATIVE,
                    },
                  },
                ],
              },
            ],
          },
        },
      } as unknown as SmartCheckoutResult;
      const sufficentSmartCheckoutResult: SmartCheckoutSufficient = {
        ...insufficientSmartCheckoutResult,
        sufficient: true,
        transactionRequirements: [
          {
            sufficient: true,
            type: ItemType.NATIVE,
          },
          {
            sufficient: true,
            type: ItemType.ERC20,
          },
        ],
      } as unknown as SmartCheckoutSufficient;

      const provider: Web3Provider = {
        provider: { isPassport: true },
      } as unknown as Web3Provider;

      const filteredSmartCheckoutResult = filterSmartCheckoutResult(
        insufficientSmartCheckoutResult,
        provider,
      );

      expect(filteredSmartCheckoutResult).toEqual(sufficentSmartCheckoutResult);
    });
  });
});

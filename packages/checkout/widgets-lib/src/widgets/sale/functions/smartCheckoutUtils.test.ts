/* eslint-disable @typescript-eslint/naming-convention */
import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  FundingRoute,
  FundingStepType,
  ItemType,
  RoutingOutcomeType,
  SmartCheckoutInsufficient,
  SmartCheckoutResult,
  SmartCheckoutSufficient,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { NATIVE } from '../../../lib';
import {
  MAX_GAS_LIMIT,
  filterSmartCheckoutResult,
  fundingRouteFees,
  isUserFractionalBalanceBlocked,
  smartCheckoutTokensList,
} from './smartCheckoutUtils';

const PURCHASE_CURRENCY_ADDRESS = '0x000000000000000000000000000000000000USDC';
const USER_ADDRESS = '0x000000000000000000000000000000000000USER';

describe('isUserFractionalBalanceBlocked', () => {
  it('should return true if purchase balance 0', async () => {
    const checkout: Checkout = {
      getAllBalances: jest.fn(() => Promise.resolve({
        balances: [
          {
            balance: BigNumber.from('0'),
            token: {
              address: PURCHASE_CURRENCY_ADDRESS,
              decimals: 6,
              symbol: 'USDC',
              type: 'ERC-20',
            },
          },
        ],
      })),
      config: {},
    } as unknown as Checkout;
    const provider: Web3Provider = {} as unknown as Web3Provider;
    const amount = '0.5';

    const userFractionalBalanceBlocked = await isUserFractionalBalanceBlocked(
      USER_ADDRESS,
      PURCHASE_CURRENCY_ADDRESS,
      amount,
      checkout,
      provider,
    );

    expect(userFractionalBalanceBlocked).toBe(true);
  });

  it('should return false if purchase balance >= purchase amount and enough gas', async () => {
    const checkout: Checkout = {
      getAllBalances: jest.fn(() => Promise.resolve({
        balances: [
          {
            balance: BigNumber.from('500000'),
            token: {
              address: PURCHASE_CURRENCY_ADDRESS,
              decimals: 6,
              symbol: 'USDC',
              type: 'ERC-20',
            },
          },
          {
            balance: BigNumber.from(MAX_GAS_LIMIT),
            token: {
              address: NATIVE,
              decimals: 18,
              name: 'IMX',
              symbol: 'IMX',
            },
          },
        ],
      })),
      config: {},
    } as unknown as Checkout;
    const provider: Web3Provider = {} as unknown as Web3Provider;
    const amount = '0.5';

    const userFractionalBalanceBlocked = await isUserFractionalBalanceBlocked(
      USER_ADDRESS,
      PURCHASE_CURRENCY_ADDRESS,
      amount,
      checkout,
      provider,
    );

    expect(userFractionalBalanceBlocked).toBe(false);
  });

  it('should return false if purchase balance >= purchase amount and zero gas on passport', async () => {
    const checkout: Checkout = {
      getAllBalances: jest.fn(() => Promise.resolve({
        balances: [
          {
            balance: BigNumber.from('500000'),
            token: {
              address: PURCHASE_CURRENCY_ADDRESS,
              decimals: 6,
              symbol: 'USDC',
              type: 'ERC-20',
            },
          },
        ],
      })),
      config: {},
    } as unknown as Checkout;
    const provider: Web3Provider = {
      provider: {
        isPassport: true,
      },
    } as unknown as Web3Provider;
    const amount = '0.5';

    const userFractionalBalanceBlocked = await isUserFractionalBalanceBlocked(
      USER_ADDRESS,
      PURCHASE_CURRENCY_ADDRESS,
      amount,
      checkout,
      provider,
    );

    expect(userFractionalBalanceBlocked).toBe(false);
  });

  it('should return true if purchase balance >= purchase amount and not enough gas', async () => {
    const checkout: Checkout = {
      getAllBalances: jest.fn(() => Promise.resolve({
        balances: [
          {
            balance: BigNumber.from('500000'),
            token: {
              address: PURCHASE_CURRENCY_ADDRESS,
              decimals: 6,
              symbol: 'USDC',
              type: 'ERC-20',
            },
          },
        ],
      })),
      config: {},
    } as unknown as Checkout;
    const provider: Web3Provider = {} as unknown as Web3Provider;
    const amount = '0.5';

    const userFractionalBalanceBlocked = await isUserFractionalBalanceBlocked(
      USER_ADDRESS,
      PURCHASE_CURRENCY_ADDRESS,
      amount,
      checkout,
      provider,
    );

    expect(userFractionalBalanceBlocked).toBe(true);
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

      const filteredSmartCheckoutResult = filterSmartCheckoutResult(sufficentSmartCheckoutResult);

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

      const filteredSmartCheckoutResult = filterSmartCheckoutResult(insufficientSmartCheckoutResult);

      expect(filteredSmartCheckoutResult).toEqual(insufficientSmartCheckoutResult);
    });

    it('should be sufficent if wallet is passport, has enough balance and only native balance is insufficient', () => {
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
        sufficient: true,
        transactionRequirements:
          insufficientSmartCheckoutResult.transactionRequirements,
      };
      const provider: Web3Provider = {
        provider: { isPassport: true },
      } as unknown as Web3Provider;

      const filteredSmartCheckoutResult = filterSmartCheckoutResult(insufficientSmartCheckoutResult, provider);

      expect(filteredSmartCheckoutResult).toEqual(sufficentSmartCheckoutResult);
    });
  });
});

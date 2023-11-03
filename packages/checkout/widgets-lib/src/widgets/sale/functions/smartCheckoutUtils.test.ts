/* eslint-disable @typescript-eslint/naming-convention */
import { Web3Provider } from '@ethersproject/providers';
import { Checkout, FundingRoute, FundingStepType } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { MAX_GAS_LIMIT, fundingRouteFees, isUserFractionalBalanceBlocked } from './smartCheckoutUtils';
import { IMX_ADDRESS_ZKEVM } from '../../../lib';

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
              address: IMX_ADDRESS_ZKEVM,
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

  const conversions = new Map<string, number>([['eth', 100], ['imx', 10]]);

  it('should aggregate fees for Bridge', () => {
    const fundingRoute: FundingRoute = {
      steps: [
        {
          type: FundingStepType.BRIDGE,
          fees: {
            approvalGasFees: ethFee,
            bridgeFees: [ethFee, ethFee],
            bridgeGasFees: ethFee,

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
            approvalGasFees: imxFee,
            swapFees: [imxFee, imxFee],
            swapGasFees: imxFee,

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
            approvalGasFees: ethFee,
            bridgeFees: [ethFee, ethFee],
            bridgeGasFees: ethFee,

          },
        },
        {
          type: FundingStepType.SWAP,
          fees: {
            approvalGasFees: imxFee,
            swapFees: [imxFee, imxFee],
            swapGasFees: imxFee,

          },
        },
      ],
    } as unknown as FundingRoute;

    const totalFees = fundingRouteFees(fundingRoute, conversions);

    expect(totalFees).toEqual('440.00');
  });
});

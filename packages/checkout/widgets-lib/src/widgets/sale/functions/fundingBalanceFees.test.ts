/* eslint-disable @typescript-eslint/naming-convention */
import { FeeType } from '@imtbl/checkout-sdk';
import { FundingBalance, FundingBalanceType } from '../types';
import {
  FeesBySymbol,
  getFundingBalanceFeeBreakDown,
  getFundingBalanceTotalFees,
} from './fundingBalanceFees';

export const SwapFundingBalanceMock = {
  type: 'SWAP',
  chainId: 13473,
  fundingItem: {
    type: 'ERC20',
    fundsRequired: {
      amount: BigInt('500000000000000000'),
      formattedAmount: '5',
    },
    userBalance: {
      balance: BigInt('100000000000000000'),
      formattedBalance: '10',
    },
    token: {
      address: '0x4B96E7b7eA673A996F140d5De411a97b7eab934E',
      circulating_market_cap: null,
      decimals: 18,
      exchange_rate: null,
      holders: '46',
      icon_url: null,
      name: 'Core',
      symbol: 'zkCORE',
      total_supply: '1000000000000000000000000000',
      type: 'ERC-20',
      volume_24h: null,
    },
  },
  fees: {
    approvalGasFee: {
      type: 'GAS',
      amount: BigInt('10000000000000'),
      formattedAmount: '0.0001',
      token: {
        name: 'Immutable Testnet Token',
        symbol: 'tIMX',
        address: 'native',
        decimals: 18,
      },
    },
    swapGasFee: {
      type: 'GAS',
      amount: BigInt('200000000000000'),
      formattedAmount: '0.002',
      token: {
        name: 'Immutable Testnet Token',
        symbol: 'tIMX',
        address: 'native',
        decimals: 18,
      },
    },
    swapFees: [
      {
        type: 'SWAP_FEE',
        amount: BigInt('500000000000000000'),
        formattedAmount: '0.5',
        token: {
          name: 'Core',
          symbol: 'zkCORE',
          address: '0x4B96E7b7eA673A996F140d5De411a97b7eab934E',
          decimals: 18,
        },
      },
      {
        type: 'SWAP_FEE',
        amount: BigInt('100000000000000000'),
        formattedAmount: '0.1',
        token: {
          name: 'Core',
          symbol: 'zkCORE',
          address: '0x4B96E7b7eA673A996F140d5De411a97b7eab934E',
          decimals: 18,
        },
      },
    ],
  },
} as FundingBalance;

describe('getFundingBalanceTotalFees', () => {
  it('should return empty when no fees', () => {
    expect(
      getFundingBalanceTotalFees({
        type: FundingBalanceType.SUFFICIENT,
      } as FundingBalance),
    ).toEqual({});
  });

  it('should get total fee amount by symbol', () => {
    const expected: FeesBySymbol = {
      tIMX: {
        type: FeeType.GAS,
        amount: expect.any(Object),
        formattedAmount: '0.00021', // sum amount of all tIMX
        token: {
          name: 'Immutable Testnet Token',
          symbol: 'tIMX',
          address: 'native',
          decimals: 18,
        },
      },
      zkCORE: {
        type: FeeType.SWAP_FEE,
        amount: expect.any(Object),
        formattedAmount: '0.6', // sum amount of all zkCORE
        token: {
          name: 'Core',
          symbol: 'zkCORE',
          address: '0x4B96E7b7eA673A996F140d5De411a97b7eab934E',
          decimals: 18,
        },
      },
    };

    const result = getFundingBalanceTotalFees(SwapFundingBalanceMock);
    expect(result).toEqual(expected);
  });
});

describe('getFundingBalanceFeeBreakDown', () => {
  const conversionsMock: Map<string, number> = new Map([
    ['tIMX', 2.3],
    ['zkCORE', 0.7],
  ]);

  const t = ((v: unknown) => v) as any;

  it('should return empty when no fees', () => {
    const sufficientFundingBalanceMock = {
      type: FundingBalanceType.SUFFICIENT,
    } as unknown as FundingBalance;

    expect(
      getFundingBalanceFeeBreakDown(
        sufficientFundingBalanceMock,
        conversionsMock,
        t,
      ),
    ).toEqual([]);
  });

  it('should return fee breakdowns', () => {
    const expected = [
      {
        amount: '0.00020',
        fiatAmount: '≈ drawers.feesBreakdown.fees.fiatPricePrefix-.--',
        label: 'drawers.feesBreakdown.fees.swapGasFee.label',
        prefix: '~ ',
        token: {
          address: 'native',
          decimals: 18,
          name: 'Immutable Testnet Token',
          symbol: 'tIMX',
        },
      },
      {
        amount: '0.00001',
        fiatAmount: '≈ drawers.feesBreakdown.fees.fiatPricePrefix-.--',
        label: 'drawers.feesBreakdown.fees.approvalFee.label',
        prefix: '~ ',
        token: {
          address: 'native',
          decimals: 18,
          name: 'Immutable Testnet Token',
          symbol: 'tIMX',
        },
      },
      {
        amount: '0.60000',
        fiatAmount: '≈ drawers.feesBreakdown.fees.fiatPricePrefix-.--',
        label: 'drawers.feesBreakdown.fees.swapSecondaryFee.label',
        prefix: '',
        token: {
          address: '0x4B96E7b7eA673A996F140d5De411a97b7eab934E',
          decimals: 18,
          name: 'Core',
          symbol: 'zkCORE',
        },
      },
    ];

    const result = getFundingBalanceFeeBreakDown(
      SwapFundingBalanceMock,
      conversionsMock,
      t,
    );

    expect(result).toEqual(expected);
  });
});

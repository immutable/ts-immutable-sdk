/* eslint-disable @typescript-eslint/naming-convention */
import { OrderQuoteCurrency, FundingBalance } from '../types';
import {
  getGasEstimate,
  getERC20ItemRequirement,
  wrapPromisesWithOnResolve,
  getFnToSortFundingBalancesByPriority,
  getFnToPushAndSortFundingBalances,
} from './fetchFundingBalancesUtils';

export const tIMXFundingBalanceMock = {
  type: 'SWAP',
  chainId: 13473,
  fundingItem: {
    type: 'NATIVE',
    fundsRequired: {
      amount: {
        type: 'BigNumber',
        hex: '0x8d8fbc4356944de4',
      } as any,
      formattedAmount: '10.200578678418853348',
    },
    userBalance: {
      balance: {
        type: 'BigNumber',
        hex: '0xa681b23e52c8a699',
      } as any,
      formattedBalance: '11.998066863038310041',
    },
    token: {
      address: 'native',
      decimals: 18,
      name: 'tIMX',
      symbol: 'tIMX',
    },
  },
  fees: {
    approvalGasFee: {
      type: 'GAS',
      amount: {
        type: 'BigNumber',
        hex: '0x00',
      } as any,
      formattedAmount: '0',
    },
    swapGasFee: {
      type: 'GAS',
      amount: {
        type: 'BigNumber',
        hex: '0x04c49d5a71b080',
      } as any,
      formattedAmount: '0.001342080013152384',
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
        amount: {
          type: 'BigNumber',
          hex: '0x0166cf2bc17daa97',
        } as any,
        formattedAmount: '0.100995828499196567',
        token: {
          name: 'Immutable Testnet Token',
          symbol: 'tIMX',
          address: 'native',
          decimals: 18,
        },
      },
    ],
  },
} as FundingBalance;

export const zkCoreFundingBalanceMock = {
  type: 'SWAP',
  chainId: 13473,
  fundingItem: {
    type: 'ERC20',
    fundsRequired: {
      amount: {
        type: 'BigNumber',
        hex: '0x064e81a551cbf9a06262',
      } as any,
      formattedAmount: '29782.386897905774518882',
    },
    userBalance: {
      balance: {
        type: 'BigNumber',
        hex: '0x1ee9709ba5e4849f9cd5',
      } as any,
      formattedBalance: '145977.200116818216197333',
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
      amount: {
        type: 'BigNumber',
        hex: '0x01ab432e4c07c4',
      } as any,
      formattedAmount: '0.000469780004603844',
      token: {
        name: 'Immutable Testnet Token',
        symbol: 'tIMX',
        address: 'native',
        decimals: 18,
      },
    },
    swapGasFee: {
      type: 'GAS',
      amount: {
        type: 'BigNumber',
        hex: '0x084b1fdc2093c0',
      } as any,
      formattedAmount: '0.00233440002287712',
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
        amount: {
          type: 'BigNumber',
          hex: '0x0ffc36dd5320e32c10',
        } as any,
        formattedAmount: '294.875117801047272464',
        token: {
          name: '',
          symbol: '',
          address: '0x4B96E7b7eA673A996F140d5De411a97b7eab934E',
          decimals: 18,
        },
      },
    ],
  },
} as FundingBalance;

const USDCFundingBalanceMock = {
  type: 'SUFFICIENT',
  fundingItem: {
    type: 'ERC20',
    token: {
      address: '0x3b2d8a1931736fc321c24864bceee981b11c3c57',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
    },
    fundsRequired: {
      amount: {
        type: 'BigNumber',
        hex: '0x01312d00',
      } as any,
      formattedAmount: '20.0',
    },
    userBalance: {
      balance: {
        type: 'BigNumber',
        hex: '0x04ee3500',
      } as any,
      formattedBalance: '82.72',
    },
  },
} as FundingBalance;

const GOGFundingBalanceMock = {
  type: 'SUFFICIENT',
  fundingItem: {
    type: 'ERC20',
    token: {
      address: '0xb8ee289c64c1a0dc0311364721ada8c3180d838c',
      name: 'Guild of Guardians',
      symbol: 'GOG',
      decimals: 18,
    },
    fundsRequired: {
      amount: {
        type: 'BigNumber',
        hex: '0x043589ebb1e87d2000',
      } as any,
      formattedAmount: '77.64485',
    },
    userBalance: {
      balance: {
        type: 'BigNumber',
        hex: '0x056bc75e2d63100000',
      } as any,
      formattedBalance: '100.0',
    },
  },
} as FundingBalance;

export const fundingBalancesMock = [
  tIMXFundingBalanceMock,
  zkCoreFundingBalanceMock,
  GOGFundingBalanceMock,
  USDCFundingBalanceMock,
] as FundingBalance[];

describe('Smart checkout item requirements', () => {
  it('should get ERC20 item requirements', () => {
    const amount = '100';
    const spenderAddress = '0x123';
    const tokenAddress = '0x456';

    expect(
      getERC20ItemRequirement(amount, spenderAddress, tokenAddress),
    ).toEqual([
      {
        type: 'ERC20',
        tokenAddress: '0x456',
        spenderAddress: '0x123',
        amount: '100',
      },
    ]);
  });

  it('should get gas estimate', () => {
    expect(getGasEstimate()).toEqual({
      type: 'GAS',
      gasToken: {
        type: 'NATIVE',
        limit: expect.any(BigInt),
      },
    });
  });
});

describe('wrapPromisesWithOnResolve', () => {
  it('should execute promises in parallel and resolve them with onResolve callback', async () => {
    const awaitedFns: Promise<number>[] = [
      new Promise((resolve) => {
        setTimeout(() => resolve(1), 100);
      }),
      new Promise((resolve) => {
        setTimeout(() => resolve(2), 200);
      }),
      new Promise((resolve) => {
        setTimeout(() => resolve(3), 50);
      }),
    ];

    const resolvedValues: number[] = [];
    const onResolve = jest.fn((value: number) => {
      resolvedValues.push(value);
    });

    try {
      const finalResult = await wrapPromisesWithOnResolve(
        awaitedFns,
        onResolve,
      );

      expect(resolvedValues).toEqual([3, 1, 2]);
      expect(onResolve).toHaveBeenCalledTimes(3);
      expect(finalResult).toEqual([1, 2, 3]);
    } catch {
      //
    }
  });

  it('should ignore rejected promises and succesfull should invoke onResolve callback', async () => {
    const awaitedFns = [
      Promise.reject(new Error('Error 1')),
      Promise.resolve(2),
      Promise.reject(new Error('Error 3')),
    ];

    const resolvedValues: number[] = [];
    const onResolve = jest.fn((value: number) => {
      resolvedValues.push(value);
    });

    await expect(
      wrapPromisesWithOnResolve(awaitedFns, onResolve),
    ).rejects.toThrow('Error 1');

    expect(resolvedValues).toEqual([2]);
    expect(onResolve).toHaveBeenCalledTimes(1);
  });
});

describe('getFnToSortFundingBalancesByPriority', () => {
  it('should sort funding balances by base', () => {
    const sortedByUSDCFirst = fundingBalancesMock.sort(
      getFnToSortFundingBalancesByPriority('USDC'),
    );
    const usdcIndex = sortedByUSDCFirst.findIndex(
      (fundingBalance) => fundingBalance.fundingItem.token.symbol === 'USDC',
    );
    expect(usdcIndex).toBe(0);

    const sortedByzkCoreFirst = fundingBalancesMock.sort(
      getFnToSortFundingBalancesByPriority('zkCORE'),
    );
    const zkCoreIndex = sortedByzkCoreFirst.findIndex(
      (fundingBalance) => fundingBalance.fundingItem.token.symbol === 'zkCORE',
    );
    expect(zkCoreIndex).toBe(0);
  });

  it('should sort funding balances by type priority', () => {
    const sortedByType = fundingBalancesMock.sort(
      getFnToSortFundingBalancesByPriority('USDC'),
    );
    const names = sortedByType.map(
      (fundingBalance) => fundingBalance.fundingItem.token.symbol,
    );

    const order1 = ['USDC', 'GOG', 'zkCORE', 'tIMX'];
    const order2 = ['USDC', 'GOG', 'tIMX', 'zkCORE'];

    const equals = order1.every((value, index) => value === names[index])
      || order2.every((value, index) => value === names[index]);

    expect(equals).toBe(true);
  });
});

describe('getFnToPushAndSortFundingBalances', () => {
  let balances: FundingBalance[] = [];
  let baseCurrency: OrderQuoteCurrency;
  let pushAndSortByUSDC: (balances: FundingBalance[]) => FundingBalance[];

  beforeAll(() => {
    baseCurrency = {
      base: true,
      address: '0x123',
      decimals: 18,
      exchangeId: 'usd-coin',
      name: 'USDC',
    };

    pushAndSortByUSDC = getFnToPushAndSortFundingBalances(baseCurrency);
  });
  it('should push and sort funding balances', () => {
    balances = pushAndSortByUSDC([tIMXFundingBalanceMock]);
    expect(balances).toHaveLength(1);
    expect(balances[0].fundingItem.token.symbol).toBe('tIMX');

    balances = pushAndSortByUSDC([GOGFundingBalanceMock]);
    expect(balances).toHaveLength(2);
    expect(balances[0].fundingItem.token.symbol).toBe('GOG');

    balances = pushAndSortByUSDC([zkCoreFundingBalanceMock, USDCFundingBalanceMock]);
    expect(balances).toHaveLength(4);
    expect(balances[0].fundingItem.token.symbol).toBe('USDC');
    expect(balances[1].fundingItem.token.symbol).toBe('GOG');
  });
});

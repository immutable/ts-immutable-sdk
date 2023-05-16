import {
  ChainId,
  Checkout,
  GetBalanceResult,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { getTokenBalances } from './tokenBalances';

describe('token balance tests', () => {
  it('should return balances for all tokens', async () => {
    const balances: GetBalanceResult[] = [
      {
        balance: BigNumber.from(1),
        token: { symbol: 'QQQ', name: 'QQQ' } as TokenInfo,
        formattedBalance: '12.34',
      },
      {
        balance: BigNumber.from(2),
        token: { symbol: 'AAA', name: 'AAA' } as TokenInfo,
        formattedBalance: '26.34',
      },
    ];

    const conversions = new Map<string, number>([
      ['aaa', 10.1234],
      ['qqq', 5.125],
    ]);

    const mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xaddress'),
      }),
    };
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });
    jest.spyOn(checkout, 'getAllBalances').mockResolvedValue({ balances });

    const actualResult = await getTokenBalances(
      checkout,
      mockProvider as unknown as Web3Provider,
      '',
      ChainId.SEPOLIA,
      conversions,
    );

    expect(actualResult.length).toBe(2);
    expect(actualResult).toEqual([
      {
        id: '-AAA',
        description: 'AAA',
        balance: '26.34',
        symbol: 'AAA',
        fiatAmount: '266.65',
      },
      {
        id: '-QQQ',
        description: 'QQQ',
        balance: '12.34',
        symbol: 'QQQ',
        fiatAmount: '63.24',
      },
    ]);
  });

  it('should return empty array when any argument is missing', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const conversions = new Map<string, number>([]);

    const actualResult = await getTokenBalances(
      checkout,
      {} as unknown as Web3Provider,
      '',
      ChainId.SEPOLIA,
      conversions,
    );

    expect(actualResult.length).toBe(0);
  });

  it('should return empty array when checkout.getAllBalances throws error', async () => {
    const mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xaddress'),
      }),
    };
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const conversions = new Map<string, number>([]);

    jest
      .spyOn(checkout, 'getAllBalances')
      .mockRejectedValue(new Error('some-err'));

    const actualResult = await getTokenBalances(
      checkout,
      mockProvider as unknown as Web3Provider,
      '',
      ChainId.SEPOLIA,
      conversions,
    );

    expect(actualResult.length).toBe(0);
  });
});

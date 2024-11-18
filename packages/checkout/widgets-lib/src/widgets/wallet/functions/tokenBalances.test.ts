import {
  ChainId,
  Checkout,
  GetBalanceResult,
  NamedBrowserProvider,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { getTokenBalances, mapTokenBalancesWithConversions } from './tokenBalances';

describe('token balance tests', () => {
  it('should return balances for all tokens', async () => {
    const balances: GetBalanceResult[] = [
      {
        balance: BigInt(1),
        token: { symbol: 'QQQ', name: 'QQQ', address: '0xQ' } as TokenInfo,
        formattedBalance: '12.34',
      },
      {
        balance: BigInt(2),
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
    const chainId = ChainId.SEPOLIA;
    jest.spyOn(checkout, 'getAllBalances').mockResolvedValue({ balances });

    const actualResult = mapTokenBalancesWithConversions(
      chainId,
      await getTokenBalances(
        checkout,
        mockProvider as unknown as NamedBrowserProvider,
        chainId,
      ),
      conversions,
    );

    expect(actualResult.length).toBe(2);
    expect(actualResult).toEqual([
      {
        id: '11155111-aaa',
        description: 'AAA',
        balance: '26.34',
        symbol: 'AAA',
        fiatAmount: '266.65',
        icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/aaa.svg',
      },
      {
        id: '11155111-qqq-0xq',
        description: 'QQQ',
        balance: '12.34',
        symbol: 'QQQ',
        fiatAmount: '63.24',
        address: '0xQ',
        icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/0xq.svg',
      },
    ]);
  });

  it('should return empty array when any argument is missing', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });
    const chainId = ChainId.SEPOLIA;

    const conversions = new Map<string, number>([]);

    const actualResult = mapTokenBalancesWithConversions(
      chainId,
      await getTokenBalances(
        checkout,
        null as unknown as NamedBrowserProvider,
        chainId,
      ),
      conversions,
    );

    expect(actualResult.length).toBe(0);
  });
});

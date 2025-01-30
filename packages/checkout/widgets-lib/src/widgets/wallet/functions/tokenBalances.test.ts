import {
  ChainId,
  Checkout,
  GetBalanceResult,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { CryptoFiat, CryptoFiatConfiguration } from '@imtbl/cryptofiat';
import { getTokenBalances, mapTokenBalancesWithConversions } from './tokenBalances';

describe('token balance tests', () => {
  it('should return balances for all tokens', async () => {
    const balances: GetBalanceResult[] = [
      {
        balance: BigNumber.from(1),
        token: { symbol: 'QQQ', name: 'QQQ', address: '0xQ' } as TokenInfo,
        formattedBalance: '12.34',
      },
      {
        balance: BigNumber.from(2),
        token: { symbol: 'AAA', name: 'AAA' } as TokenInfo,
        formattedBalance: '26.34',
      },
    ];

    const mockCryptoFiat = new CryptoFiat(new CryptoFiatConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    }));

    jest.spyOn(mockCryptoFiat, 'convert').mockResolvedValue({
      aaa: { usd: 10.1234 },
      qqq: { usd: 5.125 },
    });

    const actualResult = await mapTokenBalancesWithConversions(
      ChainId.SEPOLIA,
      balances,
      mockCryptoFiat,
    );

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
      baseConfig: { environment: Environment.SANDBOX },
    });
    const chainId = ChainId.SEPOLIA;

    const mockCryptoFiat = new CryptoFiat(new CryptoFiatConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    }));

    const actualResult = await mapTokenBalancesWithConversions(
      chainId,
      await getTokenBalances(
        checkout,
        null as unknown as Web3Provider,
        chainId,
      ),
      mockCryptoFiat,
    );

    expect(actualResult.length).toBe(0);
  });
});

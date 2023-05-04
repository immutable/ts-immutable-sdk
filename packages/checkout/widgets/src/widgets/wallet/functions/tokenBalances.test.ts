import {
  ChainId,
  Checkout,
  GetBalanceResult,
  TokenInfo,
} from '@imtbl/checkout-sdk-web';
import { BigNumber } from 'ethers';
import { getTokenBalances } from './tokenBalances';
import { Web3Provider } from '@ethersproject/providers';

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

    const mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xaddress'),
      }),
    };
    const checkout = new Checkout();
    jest.spyOn(checkout, 'getAllBalances').mockResolvedValue({ balances });

    const actualResult = await getTokenBalances(
      checkout,
      mockProvider as unknown as Web3Provider,
      '',
      ChainId.GOERLI
    );

    expect(actualResult.length).toBe(2);

    actualResult.forEach((tokenBalance, index) => {
      expect(tokenBalance.balance).toBe(balances[index].formattedBalance);
      expect(tokenBalance.symbol).toBe(balances[index].token.symbol);
      expect(tokenBalance.description).toBe(balances[index].token.name);
      expect(tokenBalance.fiatAmount).toBe('23.50');
    });
  });
  it('should return empty array when any argument is missing', async () => {
    const checkout = new Checkout();

    const actualResult = await getTokenBalances(
      checkout,
      {} as unknown as Web3Provider,
      '',
      ChainId.GOERLI
    );

    expect(actualResult.length).toBe(0);
  });

  it('should return empty array when checkout.getAllBalances throws error', async () => {
    const mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xaddress'),
      }),
    };
    const checkout = new Checkout();
    jest
      .spyOn(checkout, 'getAllBalances')
      .mockRejectedValue(new Error('some-err'));

    const actualResult = await getTokenBalances(
      checkout,
      mockProvider as unknown as Web3Provider,
      '',
      ChainId.GOERLI
    );

    expect(actualResult.length).toBe(0);
  });
});

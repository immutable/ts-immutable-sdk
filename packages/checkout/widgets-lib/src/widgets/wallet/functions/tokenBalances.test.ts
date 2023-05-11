import {
  ChainId,
  Checkout,
  GetBalanceResult,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { getTokenBalances } from './tokenBalances';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';

describe('token balance tests', () => {
<<<<<<< main
  // describe('getTokenBalances', () => {
  //   const balances: GetBalanceResult[] = [
  //     {
  //       balance: BigNumber.from(1),
  //       token: { symbol: 'ETH', name: 'Ethereum' } as TokenInfo,
  //       formattedBalance: '12.34',
  //     },
  //     {
  //       balance: BigNumber.from(2),
  //       token: { symbol: 'IMX', name: 'Immutable X' } as TokenInfo,
  //       formattedBalance: '26.34',
  //     },
  //     {
  //       balance: BigNumber.from(0),
  //       token: { symbol: 'MATIC', name: 'Polygon' } as TokenInfo,
  //       formattedBalance: '0.00',
  //     },
  //   ];

<<<<<<< main
  //   const mockProvider = {
  //     getSigner: jest.fn().mockReturnValue({
  //       getAddress: jest.fn().mockResolvedValue('0xaddress'),
  //     }),
  //   };
  //   const checkout = new Checkout({
  //     baseConfig: { environment: Environment.PRODUCTION },
  //   });
  //   jest.spyOn(checkout, 'getAllBalances').mockResolvedValue({ balances });
=======
    it('should return an empty array if checkout, provider or chainId are not provided', async () => {
      const checkout = new Checkout({
        baseConfig: { environment: Environment.PRODUCTION },
      });
      jest.spyOn(checkout, 'getAllBalances').mockResolvedValue({ balances });
>>>>>>> Use checkout config

<<<<<<< main
    const actualResult = await getTokenBalances(
      checkout,
      mockProvider as unknown as Web3Provider,
      '',
      ChainId.SEPOLIA
    );
=======
>>>>>>> Get token balance from internal cryptofiat package

<<<<<<< main
  //     const cryptoFiat = new CryptoFiat(new CryptoFiatConfiguration({}));
  //     jest.spyOn(cryptoFiat, 'convert').mockImplementation(() =>
  //       Promise.resolve({
  //         imx: { usd: 0.75, aud: 1.1 },
  //         eth: { usd: 1800, aud: 2600 },
  //         matic: { usd: 0.9, aud: 1.3 },
  //       }),
  //     );

  //     const result = await getTokenBalances(checkout, mockProvider , '', ChainId.ETHEREUM, cryptoFiat);
  //     expect(result).toEqual([
  //       {
  //         balance: "26.34",
  //         description: "Immutable X",
  //         fiatAmount: "19.76",
  //         id: "-IMX",
  //         symbol: "IMX",
  //       },
  //       {
  //         balance: "12.34",
  //         description: "Ethereum",
  //         fiatAmount: "22212.00",
  //         id: "-ETH",
  //         symbol: "ETH",
  //       },
  //       {
  //         balance: "0.00",
  //         description: "Polygon",
  //         fiatAmount: "-.--",
  //         id: "-MATIC",
  //         symbol: "MATIC",
  //       },
  //     ]);
  //   });
  // });
  // it('should return empty array when any argument is missing', async () => {
  //   const checkout = new Checkout({
  //     baseConfig: { environment: Environment.PRODUCTION },
  //   });

<<<<<<< main
    const actualResult = await getTokenBalances(
      checkout,
      {} as unknown as Web3Provider,
      '',
      ChainId.SEPOLIA
    );
=======
  // describe('calculateCryptoToFiatValue', () => {
  //   it('should return zero balance string if balance is not provided', () => {
  //     const result = calculateCryptoToFiatValue('', 'eth', {});
  //     expect(result).toBe('-.--');
  //   });
  
  //   it('should return zero balance string if no conversion is found', () => {
  //     const result = calculateCryptoToFiatValue('10', 'eth', {});
  //     expect(result).toBe('-.--');
  //   });
  
  //   it('should return zero balance string if balance is zero', () => {
  //     const result = calculateCryptoToFiatValue('0', 'eth', { eth: { usd: 1800 } });
  //     expect(result).toBe('-.--');
  //   });
  
  //   it('should return zero balance string if balance is NaN', () => {
  //     const result = calculateCryptoToFiatValue('abc', 'eth', { eth: { usd: 1800 } });
  //     expect(result).toBe('-.--');
  //   });
  
  //   it('should return zero balance string if no USD conversion is found', () => {
  //     const result = calculateCryptoToFiatValue('10', 'eth', { eth: { aud: 1800 } });
  //     expect(result).toBe('-.--');
  //   });
  
  //   it('should return calculated fiat value if valid balance and conversion are provided', () => {
  //     const result = calculateCryptoToFiatValue('10', 'eth', { eth: { usd: 1800 } });
  //     expect(result).toBe(formatFiatString(10 * 1800));
  //   });
  
  //   it('should handle lowercase and uppercase symbols', () => {
  //     const result = calculateCryptoToFiatValue('10', 'eth', { eth: { usd: 1800 } });
  //     expect(result).toBe(formatFiatString(10 * 1800));
  //   });
  // });
<<<<<<< main
>>>>>>> Get token balance from internal cryptofiat package
=======
=======
      const cryptoFiat = new CryptoFiat(new CryptoFiatConfiguration({}));
      jest.spyOn(cryptoFiat, 'convert').mockImplementation(() =>
        Promise.resolve({
          imx: { usd: 0.75, aud: 1.1 },
          eth: { usd: 1800, aud: 2600 },
          matic: { usd: 0.9, aud: 1.3 },
        })
      );

      const result = await getTokenBalances(
        checkout,
        mockProvider,
        '',
        ChainId.ETHEREUM,
        cryptoFiat
      );
      expect(result).toEqual([
        {
          balance: '26.34',
          description: 'Immutable X',
          fiatAmount: '19.76',
          id: '-IMX',
          symbol: 'IMX',
        },
        {
          balance: '12.34',
          description: 'Ethereum',
          fiatAmount: '22212.00',
          id: '-ETH',
          symbol: 'ETH',
        },
        {
          balance: '0.00',
          description: 'Polygon',
          fiatAmount: '-.--',
          id: '-MATIC',
          symbol: 'MATIC',
        },
      ]);
=======
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
>>>>>>> CryptoFiat context
    });
    jest.spyOn(checkout, 'getAllBalances').mockResolvedValue({ balances });

    const actualResult = await getTokenBalances(
      checkout,
      mockProvider as unknown as Web3Provider,
      '',
      ChainId.GOERLI,
      conversions
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
      ChainId.GOERLI,
      conversions
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
<<<<<<< main
  });
>>>>>>> Prettier
>>>>>>> Prettier
=======
>>>>>>> CryptoFiat context

    const conversions = new Map<string, number>([]);

    jest
      .spyOn(checkout, 'getAllBalances')
      .mockRejectedValue(new Error('some-err'));

<<<<<<< main
<<<<<<< main
=======
>>>>>>> CryptoFiat context
    const actualResult = await getTokenBalances(
      checkout,
      mockProvider as unknown as Web3Provider,
      '',
<<<<<<< main
      ChainId.SEPOLIA
    );
=======
  //   it('should format number with less than two decimal places', () => {
  //     const result = formatFiatString(123.4);
  //     expect(result).toBe('123.40');
  //   });
>>>>>>> Get token balance from internal cryptofiat package
=======
      ChainId.GOERLI,
      conversions
    );
>>>>>>> CryptoFiat context

    expect(actualResult.length).toBe(0);
  });
});

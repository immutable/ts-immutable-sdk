import { ChainId, GetBalanceResult, TokenInfo } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import {
  calculateCryptoToFiat,
  formatFiatString,
  formatZeroAmount,
  sortTokensByAmount,
  tokenValueFormat,
} from './utils';

describe('utils', () => {
  describe('sortTokensByAmount', () => {
    it('should sort tokens by amount', () => {
      const tokens: GetBalanceResult[] = [
        {
          balance: BigNumber.from('100000000000000000000'),
          formattedBalance: '100.0',
          token: {
            name: 'Matic',
            symbol: 'MATIC',
          } as unknown as TokenInfo,
        },
        {
          balance: BigNumber.from('50000000000000000000'),
          formattedBalance: '50.0',
          token: {
            name: 'Gods Unchained',
            symbol: 'GODS',
          } as unknown as TokenInfo,
        },
        {
          balance: BigNumber.from('50000000000000000001'),
          formattedBalance: '50.0',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
          } as unknown as TokenInfo,
        },
      ];

      expect(
        sortTokensByAmount(Environment.PRODUCTION, tokens, ChainId.ETHEREUM),
      ).toEqual([
        {
          balance: BigNumber.from('100000000000000000000'),
          formattedBalance: '100.0',
          token: {
            name: 'Matic',
            symbol: 'MATIC',
          } as unknown as TokenInfo,
        },
        {
          balance: BigNumber.from('50000000000000000001'),
          formattedBalance: '50.0',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
          } as unknown as TokenInfo,
        },
        {
          balance: BigNumber.from('50000000000000000000'),
          formattedBalance: '50.0',
          token: {
            name: 'Gods Unchained',
            symbol: 'GODS',
          } as unknown as TokenInfo,
        },
      ]);
    });

    const testCases = [
      {
        text: 'IMX is first in list',
        tokens: [
          {
            balance: BigNumber.from('0'),
            formattedBalance: '0.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
            } as unknown as TokenInfo,
          },
          {
            balance: BigNumber.from('100000000000000000000'),
            formattedBalance: '100.0',
            token: {
              name: 'Matic',
              symbol: 'MATIC',
            } as unknown as TokenInfo,
          },
          {
            balance: BigNumber.from('50000000000000000000'),
            formattedBalance: '50.0',
            token: {
              name: 'Gods Unchained',
              symbol: 'GODS',
            } as unknown as TokenInfo,
          },
          {
            balance: BigNumber.from('50000000000000000001'),
            formattedBalance: '50.0',
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
            } as unknown as TokenInfo,
          },
          {
            balance: BigNumber.from('0'),
            formattedBalance: '0.0',
            token: {
              name: 'AAA',
              symbol: 'AAA',
            } as unknown as TokenInfo,
          },
        ],
      },
      {
        text: 'IMX is NOT first in list',
        tokens: [
          {
            balance: BigNumber.from('100000000000000000000'),
            formattedBalance: '100.0',
            token: {
              name: 'Matic',
              symbol: 'MATIC',
            } as unknown as TokenInfo,
          },
          {
            balance: BigNumber.from('50000000000000000000'),
            formattedBalance: '50.0',
            token: {
              name: 'Gods Unchained',
              symbol: 'GODS',
            } as unknown as TokenInfo,
          },
          {
            balance: BigNumber.from('0'),
            formattedBalance: '0.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
            } as unknown as TokenInfo,
          },
          {
            balance: BigNumber.from('50000000000000000001'),
            formattedBalance: '50.0',
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
            } as unknown as TokenInfo,
          },
          {
            balance: BigNumber.from('0'),
            formattedBalance: '0.0',
            token: {
              name: 'AAA',
              symbol: 'AAA',
            } as unknown as TokenInfo,
          },
        ],
      },
    ];
    testCases.forEach((testcase) => {
      it(`When zkevm and ${testcase.text} then should sort tokens by amount and put imx at top`, () => {
        expect(
          sortTokensByAmount(
            Environment.PRODUCTION,
            testcase.tokens,
            ChainId.POLYGON_ZKEVM,
          ),
        ).toEqual([
          {
            balance: BigNumber.from('0'),
            formattedBalance: '0.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
            } as unknown as TokenInfo,
          },
          {
            balance: BigNumber.from('100000000000000000000'),
            formattedBalance: '100.0',
            token: {
              name: 'Matic',
              symbol: 'MATIC',
            } as unknown as TokenInfo,
          },
          {
            balance: BigNumber.from('50000000000000000001'),
            formattedBalance: '50.0',
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
            } as unknown as TokenInfo,
          },
          {
            balance: BigNumber.from('50000000000000000000'),
            formattedBalance: '50.0',
            token: {
              name: 'Gods Unchained',
              symbol: 'GODS',
            } as unknown as TokenInfo,
          },
          {
            balance: BigNumber.from('0'),
            formattedBalance: '0.0',
            token: {
              name: 'AAA',
              symbol: 'AAA',
            } as unknown as TokenInfo,
          },
        ]);
      });
    });

    it('should sort tokens by amount and not put imx at top when not zkEVM', () => {
      const tokens: GetBalanceResult[] = [
        {
          balance: BigNumber.from('100000000000000000000'),
          formattedBalance: '100.0',
          token: {
            name: 'Matic',
            symbol: 'MATIC',
          } as unknown as TokenInfo,
        },
        {
          balance: BigNumber.from('50000000000000000000'),
          formattedBalance: '50.0',
          token: {
            name: 'Gods Unchained',
            symbol: 'GODS',
          } as unknown as TokenInfo,
        },
        {
          balance: BigNumber.from('0'),
          formattedBalance: '0.0',
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
          } as unknown as TokenInfo,
        },
        {
          balance: BigNumber.from('50000000000000000001'),
          formattedBalance: '50.0',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
          } as unknown as TokenInfo,
        },
      ];

      expect(
        sortTokensByAmount(Environment.PRODUCTION, tokens, ChainId.ETHEREUM),
      ).toEqual([
        {
          balance: BigNumber.from('100000000000000000000'),
          formattedBalance: '100.0',
          token: {
            name: 'Matic',
            symbol: 'MATIC',
          } as unknown as TokenInfo,
        },
        {
          balance: BigNumber.from('50000000000000000001'),
          formattedBalance: '50.0',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
          } as unknown as TokenInfo,
        },
        {
          balance: BigNumber.from('50000000000000000000'),
          formattedBalance: '50.0',
          token: {
            name: 'Gods Unchained',
            symbol: 'GODS',
          } as unknown as TokenInfo,
        },
        {
          balance: BigNumber.from('0'),
          formattedBalance: '0.0',
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
          } as unknown as TokenInfo,
        },
      ]);
    });
  });

  describe('calculateCryptoToFiat', () => {
    it('should return zero balance string if balance is not provided', () => {
      const result = calculateCryptoToFiat(
        '',
        'eth',
        new Map<string, number>(),
      );
      expect(result).toBe('0.00');
    });

    it('should return zero balance string if no conversion is found', () => {
      const result = calculateCryptoToFiat(
        '10',
        'eth',
        new Map<string, number>(),
      );
      expect(result).toBe('0.00');
    });

    it('should return zero balance string if balance is zero', () => {
      const result = calculateCryptoToFiat(
        '0',
        'eth',
        new Map<string, number>([['eth', 1800]]),
      );
      expect(result).toBe('0.00');
    });

    it('should return zero balance string if balance is NaN', () => {
      const result = calculateCryptoToFiat(
        'abc',
        'eth',
        new Map<string, number>([['eth', 1800]]),
      );
      expect(result).toBe('0.00');
    });

    it('should return calculated fiat value if valid balance and conversion are provided', () => {
      const result = calculateCryptoToFiat(
        '10',
        'eth',
        new Map<string, number>([['eth', 1800]]),
      );
      expect(result).toBe('18000.00');
    });

    it('should handle lowercase and uppercase symbols', () => {
      const result = calculateCryptoToFiat(
        '10',
        'eth',
        new Map<string, number>([['eth', 1800]]),
      );
      expect(result).toBe('18000.00');
    });
  });

  describe('formatFiatString', () => {
    it('should format number', () => {
      const result = formatFiatString(123.12);
      expect(result).toBe('123.12');
    });

    it('should format number and round down', () => {
      const result = formatFiatString(123.124);
      expect(result).toBe('123.12');
    });

    it('should format number and round up', () => {
      const result = formatFiatString(123.125);
      expect(result).toBe('123.13');
    });

    it('should format number with less than two decimal places', () => {
      const result = formatFiatString(123.4);
      expect(result).toBe('123.40');
    });

    it('should format number with no decimal places', () => {
      const result = formatFiatString(123);
      expect(result).toBe('123.00');
    });
  });

  describe('formatZeroAmount', () => {
    it('should return same amount', () => {
      const result = formatZeroAmount('123.12');
      expect(result).toBe('123.12');
    });

    it('should return -.-- if amount empty', () => {
      const result = formatZeroAmount('');
      expect(result).toBe('-.--');
    });

    it('should return -.-- if amount 0.00', () => {
      const result = formatZeroAmount('0.00');
      expect(result).toBe('-.--');
    });
  });

  describe('tokenValueFormat', () => {
    expect(tokenValueFormat('11.2233445566')).toEqual('11.223344');
  });
});

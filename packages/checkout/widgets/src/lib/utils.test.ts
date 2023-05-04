import { ChainId, GetBalanceResult, TokenInfo } from '@imtbl/checkout-sdk-web';
import { BigNumber } from 'ethers';
import { sortTokensByAmount } from './utils';

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

      expect(sortTokensByAmount(tokens, ChainId.ETHEREUM)).toEqual([
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

    it('should sort tokens by amount and put imx at top when zkEVM', () => {
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
        {
          balance: BigNumber.from('0'),
          formattedBalance: '0.0',
          token: {
            name: 'AAA',
            symbol: 'AAA',
          } as unknown as TokenInfo,
        },
      ];

      expect(sortTokensByAmount(tokens, ChainId.POLYGON)).toEqual([
        {
          balance: BigNumber.from('0'),
          formattedBalance: '0.0',
          token: {
            name: 'ImmutableX',
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

      expect(sortTokensByAmount(tokens, ChainId.ETHEREUM)).toEqual([
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
});

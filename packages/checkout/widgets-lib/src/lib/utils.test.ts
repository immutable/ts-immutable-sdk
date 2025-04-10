import {
  ChainId, Checkout, GetBalanceResult, TokenInfo,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { parseUnits } from 'ethers';
import {
  calculateCryptoToFiat,
  calculateFeesFiat,
  formatFiatString,
  formatZeroAmount,
  isNativeToken,
  isZkEvmChainId,
  sortTokensByAmount,
  tokenValueFormat,
} from './utils';
import {
  DEFAULT_GT_ONE_TOKEN_FORMATTING_DECIMALS, DEFAULT_TOKEN_FORMATTING_DECIMALS, NATIVE,
} from './constants';

const checkout = new Checkout({
  baseConfig: {
    environment: Environment.SANDBOX,
  },
});

const fromToken = { name: 'Guild of Guardians', symbol: 'GOG', decimals: 18 } as TokenInfo;
const gasFeeToken = { name: 'Immutable', symbol: 'IMX', decimals: 18 } as TokenInfo;
const conversions = new Map<string, number>([['imx', 0.6441], ['gog', 0.01684]]);

describe('utils', () => {
  describe('calculateFeesFiat', () => {
    it('includes the USD equivalent of the secondary fees', () => {
      const gasFeeInIMX = 0;
      const secondaryFeeInGOG = 0.456;
      const quoteWithSecondaryFees = {
        quote: {
          fees: [{
            amount: { value: parseUnits(secondaryFeeInGOG.toString(), 18) },
          }],
        },
      } as any;

      const feesInFiat = calculateFeesFiat(
        quoteWithSecondaryFees,
        fromToken,
        gasFeeToken,
        conversions,
        gasFeeInIMX.toString(),
      );

      expect(feesInFiat).toBe(0.00767904); // secondaryFeeInGOG * conversions.get('gog'));
    });

    it('includes the USD equivalent of the gas fees', () => {
      const gasFeeInIMX = 0.123;
      const quoteWithoutSecondaryFees = { quote: { fees: [] } } as any;

      const feesInFiat = calculateFeesFiat(
        quoteWithoutSecondaryFees,
        fromToken,
        gasFeeToken,
        conversions,
        gasFeeInIMX.toString(),
      );

      expect(feesInFiat).toBe(0.0792243); // gasFeeInIMX * conversions.get('imx'));
    });

    it('includes both types of fees when present', () => {
      const gasFeeInIMX = 0.123;
      const secondaryFeeInGOG = 0.456;
      const quoteWithSecondaryFees = {
        quote: {
          fees: [{
            amount: { value: parseUnits(secondaryFeeInGOG.toString(), 18) },
          }],
        },
      } as any;

      const feesInFiat = calculateFeesFiat(
        quoteWithSecondaryFees,
        fromToken,
        gasFeeToken,
        conversions,
        gasFeeInIMX.toString(),
      );

      expect(feesInFiat).toBe(0.08690334); // both values above summed.
    });
  });

  describe('sortTokensByAmount', () => {
    it('should sort tokens by amount', () => {
      const tokens: GetBalanceResult[] = [
        {
          balance: BigInt('100000000000000000000'),
          formattedBalance: '100.0',
          token: {
            name: 'Matic',
            symbol: 'MATIC',
          } as unknown as TokenInfo,
        },
        {
          balance: BigInt('50000000000000000000'),
          formattedBalance: '50.0',
          token: {
            name: 'Gods Unchained',
            symbol: 'GODS',
          } as unknown as TokenInfo,
        },
        {
          balance: BigInt('50000000000000000001'),
          formattedBalance: '50.0',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
          } as unknown as TokenInfo,
        },
      ];

      expect(
        sortTokensByAmount(checkout.config, tokens, ChainId.ETHEREUM),
      ).toEqual([
        {
          balance: BigInt('100000000000000000000'),
          formattedBalance: '100.0',
          token: {
            name: 'Matic',
            symbol: 'MATIC',
          } as unknown as TokenInfo,
        },
        {
          balance: BigInt('50000000000000000001'),
          formattedBalance: '50.0',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
          } as unknown as TokenInfo,
        },
        {
          balance: BigInt('50000000000000000000'),
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
            balance: BigInt('0'),
            formattedBalance: '0.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
            } as unknown as TokenInfo,
          },
          {
            balance: BigInt('100000000000000000000'),
            formattedBalance: '100.0',
            token: {
              name: 'Matic',
              symbol: 'MATIC',
            } as unknown as TokenInfo,
          },
          {
            balance: BigInt('50000000000000000000'),
            formattedBalance: '50.0',
            token: {
              name: 'Gods Unchained',
              symbol: 'GODS',
            } as unknown as TokenInfo,
          },
          {
            balance: BigInt('50000000000000000001'),
            formattedBalance: '50.0',
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
            } as unknown as TokenInfo,
          },
          {
            balance: BigInt('0'),
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
            balance: BigInt('100000000000000000000'),
            formattedBalance: '100.0',
            token: {
              name: 'Matic',
              symbol: 'MATIC',
            } as unknown as TokenInfo,
          },
          {
            balance: BigInt('50000000000000000000'),
            formattedBalance: '50.0',
            token: {
              name: 'Gods Unchained',
              symbol: 'GODS',
            } as unknown as TokenInfo,
          },
          {
            balance: BigInt('0'),
            formattedBalance: '0.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
            } as unknown as TokenInfo,
          },
          {
            balance: BigInt('50000000000000000001'),
            formattedBalance: '50.0',
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
            } as unknown as TokenInfo,
          },
          {
            balance: BigInt('0'),
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
            checkout.config,
            testcase.tokens,
            ChainId.IMTBL_ZKEVM_TESTNET,
          ),
        ).toEqual([
          {
            balance: BigInt('0'),
            formattedBalance: '0.0',
            token: {
              name: 'IMX',
              symbol: 'IMX',
            } as unknown as TokenInfo,
          },
          {
            balance: BigInt('100000000000000000000'),
            formattedBalance: '100.0',
            token: {
              name: 'Matic',
              symbol: 'MATIC',
            } as unknown as TokenInfo,
          },
          {
            balance: BigInt('50000000000000000001'),
            formattedBalance: '50.0',
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
            } as unknown as TokenInfo,
          },
          {
            balance: BigInt('50000000000000000000'),
            formattedBalance: '50.0',
            token: {
              name: 'Gods Unchained',
              symbol: 'GODS',
            } as unknown as TokenInfo,
          },
          {
            balance: BigInt('0'),
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
          balance: BigInt('100000000000000000000'),
          formattedBalance: '100.0',
          token: {
            name: 'Matic',
            symbol: 'MATIC',
          } as unknown as TokenInfo,
        },
        {
          balance: BigInt('50000000000000000000'),
          formattedBalance: '50.0',
          token: {
            name: 'Gods Unchained',
            symbol: 'GODS',
          } as unknown as TokenInfo,
        },
        {
          balance: BigInt('0'),
          formattedBalance: '0.0',
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
          } as unknown as TokenInfo,
        },
        {
          balance: BigInt('50000000000000000001'),
          formattedBalance: '50.0',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
          } as unknown as TokenInfo,
        },
      ];

      expect(
        sortTokensByAmount(checkout.config, tokens, ChainId.ETHEREUM),
      ).toEqual([
        {
          balance: BigInt('100000000000000000000'),
          formattedBalance: '100.0',
          token: {
            name: 'Matic',
            symbol: 'MATIC',
          } as unknown as TokenInfo,
        },
        {
          balance: BigInt('50000000000000000001'),
          formattedBalance: '50.0',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
          } as unknown as TokenInfo,
        },
        {
          balance: BigInt('50000000000000000000'),
          formattedBalance: '50.0',
          token: {
            name: 'Gods Unchained',
            symbol: 'GODS',
          } as unknown as TokenInfo,
        },
        {
          balance: BigInt('0'),
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

    it('should return 0.00 if allow zero is true', () => {
      let result = formatZeroAmount('0.00', true);
      expect(result).toBe('0.00');
      result = formatZeroAmount('', true);
      expect(result).toBe('-.--');
    });

    it('should return -.-- if amount 0.00', () => {
      const result = formatZeroAmount('0.00');
      expect(result).toBe('-.--');
    });
  });

  describe('tokenValueFormat', () => {
    it(`should format number with more than ${DEFAULT_TOKEN_FORMATTING_DECIMALS} decimals`, () => {
      expect(tokenValueFormat('11.2233445566')).toEqual('11.22');
    });

    it('should format number without decimal places', () => {
      expect(tokenValueFormat('112233445566')).toEqual('112233445566');
    });

    // eslint-disable-next-line max-len
    it(`should format number with ${DEFAULT_GT_ONE_TOKEN_FORMATTING_DECIMALS} decimals if number greater than 1`, () => {
      expect(tokenValueFormat('11.223')).toEqual('11.22');
    });

    it('should format number with 0 decimals if number greater than 1 and .00 decimals', () => {
      expect(tokenValueFormat('11.00')).toEqual('11');
    });

    it('should format number removing the decimals', () => {
      expect(tokenValueFormat('11.001')).toEqual('11');
    });

    it(`should format number to ${DEFAULT_TOKEN_FORMATTING_DECIMALS} decimal places`, () => {
      expect(tokenValueFormat('0.0000012')).toEqual('0.00000');
    });

    it(`should format to default maximum of ${DEFAULT_TOKEN_FORMATTING_DECIMALS} decimal places`, () => {
      expect(tokenValueFormat('0.00000012345')).toEqual('0.00000');
    });

    it('should format to custom maximum decimal places of 3', () => {
      expect(tokenValueFormat('0.00000012345', 3)).toEqual('0.000');
    });

    it('should format to custom maximum decimal places of 18', () => {
      expect(tokenValueFormat('0.000000000000000000', 18)).toEqual('0.000000000000000000');
    });

    it('should format to first non zero digit before maximum decimal places of 18', () => {
      expect(tokenValueFormat('0.0000000012345', 18)).toEqual('0.000000001');
    });
  });

  describe('isNativeToken', () => {
    it('should return true if address is undefined', () => {
      expect(isNativeToken(undefined)).toBeTruthy();
    });

    it('should return true if address is empty', () => {
      expect(isNativeToken('')).toBeTruthy();
    });

    it('should return true if address is `native`', () => {
      expect(isNativeToken(NATIVE)).toBeTruthy();
    });

    it('should return true if address is `NATIVE`', () => {
      expect(isNativeToken('NATIVE')).toBeTruthy();
    });

    it('should return false if address is not NATIVE', () => {
      expect(isNativeToken('0x123')).toBeFalsy();
    });
  });

  describe('isZkEvmChainId', () => {
    it('should return true if chainId is zkEVM devnet', () => {
      expect(isZkEvmChainId(ChainId.IMTBL_ZKEVM_DEVNET)).toBeTruthy();
    });

    it('should return true if chainId is zkEVM testnet', () => {
      expect(isZkEvmChainId(ChainId.IMTBL_ZKEVM_TESTNET)).toBeTruthy();
    });

    it('should return true if chainId is zkEVM mainnet', () => {
      expect(isZkEvmChainId(ChainId.IMTBL_ZKEVM_MAINNET)).toBeTruthy();
    });

    it('should return false if chainId is not zkEVM', () => {
      expect(isZkEvmChainId(ChainId.SEPOLIA)).toBeFalsy();
    });
  });
});

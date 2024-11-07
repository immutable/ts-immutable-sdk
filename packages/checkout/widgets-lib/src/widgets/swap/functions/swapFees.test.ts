import {
  Amount,
  Fee,
  Quote,
  TransactionResponse,
} from '@imtbl/dex-sdk';
import { formatSwapFees } from './swapFees';
import { CryptoFiatState } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { calculateCryptoToFiat, tokenValueFormat } from '../../../lib/utils';

jest.mock('../../../lib/utils');

describe('formatSwapFees', () => {
  const mockTranslate = ((labelKey) => labelKey) as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should format swap gas fee correctly', () => {
    const mockGasFeeQuote = {
      quote: {
        amount: {} as Amount,
        amountWithMaxSlippage: {} as Amount,
        slippage: 0,
        fees: [],
      } as Quote,
      swap: {
        gasFeeEstimate: {
          value: BigInt(100),
          token: {
            decimals: 18,
            symbol: 'ETH',
          },
        },
      },
      approval: null,
    } as TransactionResponse;
    const cryptoFiatState = {
      conversions: {},
    } as CryptoFiatState;
    (calculateCryptoToFiat as jest.Mock).mockReturnValue('FiatValue:1');
    (tokenValueFormat as jest.Mock).mockReturnValue('Formatted:1');

    const fees = formatSwapFees(mockGasFeeQuote, cryptoFiatState, mockTranslate);
    expect(fees).toEqual([
      {
        label: 'drawers.feesBreakdown.fees.swapGasFee.label',
        fiatAmount: '≈ drawers.feesBreakdown.fees.fiatPricePrefixFiatValue:1',
        amount: 'Formatted:1',
        prefix: '≈ ',
        token: {
          decimals: 18,
          symbol: 'ETH',
        },
      },
    ]);
  });

  it('should format a secondary fee correctly', () => {
    const mockSecondaryFeeQuote = {
      quote: {
        amount: {} as Amount,
        amountWithMaxSlippage: {} as Amount,
        slippage: 0,
        fees: [{
          recipient: '0x123',
          basisPoints: 100,
          amount: {
            value: BigInt(100),
            token: {
              symbol: 'ETH',
              address: '0x123',
              chainId: 1,
              decimals: 18,
            },
          },
        } as Fee],
      } as Quote,
      swap: {
        gasFeeEstimate: {
          value: BigInt(0),
        },
      },
      approval: null,
    } as TransactionResponse;
    (calculateCryptoToFiat as jest.Mock).mockReturnValue('FiatValue:0.5');
    (tokenValueFormat as jest.Mock).mockReturnValue('Formatted:0.5');
    const cryptoFiatState = {
      conversions: {},
    } as CryptoFiatState;

    const fees = formatSwapFees(mockSecondaryFeeQuote, cryptoFiatState, mockTranslate);
    expect(fees).toEqual([
      {
        label: 'drawers.feesBreakdown.fees.swapSecondaryFee.label',
        fiatAmount: '≈ drawers.feesBreakdown.fees.fiatPricePrefixFiatValue:0.5',
        amount: 'Formatted:0.5',
        prefix: '',
        token: {
          decimals: 18,
          symbol: 'ETH',
          address: '0x123',
          chainId: 1,
        },
      },
    ]);
  });
});

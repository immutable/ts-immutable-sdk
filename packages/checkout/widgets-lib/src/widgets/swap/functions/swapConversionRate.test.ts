import { BigNumber } from 'ethers';
import {
  Amount,
  Fee,
  Quote,
  TransactionResponse,
} from '@imtbl/dex-sdk';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { TFunction } from 'i18next';
import { formatQuoteConversionRate } from './swapConversionRate';

describe('formatQuoteConversionRate', () => {
  const mockTranslate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate the correct conversion rate', () => {
    const fromAmount = '1';
    const fromToken = {
      name: 'ETH',
      symbol: 'ETH',
      address: '0x123',
      chainId: 1,
      decimals: 18,
    } as TokenInfo;
    const mockQuote = {
      quote: {
        amount: {
          value: BigNumber.from('2000000000000000000'),
          token: {
            symbol: 'DAI',
            address: '0x456',
            chainId: 1,
            decimals: 18,
          },
        } as Amount,
        amountWithMaxSlippage: {} as Amount,
        slippage: 0,
        fees: [{
          recipient: '0x000',
          basisPoints: 100,
          amount: {
            value: BigNumber.from('100000000000000000'),
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
          value: BigNumber.from(100),
        },
      },
      approval: {
        gasFeeEstimate: {
          value: BigNumber.from(50),
        },
      },
    } as TransactionResponse;
    const labelKey = 'conversion.label';

    formatQuoteConversionRate(fromAmount, fromToken, mockQuote, labelKey, mockTranslate as unknown as TFunction);

    expect(mockTranslate).toHaveBeenCalledWith(labelKey, {
      fromSymbol: 'ETH',
      toSymbol: 'DAI',
      rate: '2',
      fee: 1,
    });
  });

  it('should handle fromAmount with decimals', () => {
    const fromAmount = '1.50';
    const fromToken = {
      name: 'ETH',
      symbol: 'ETH',
      address: '0x123',
      chainId: 1,
      decimals: 18,
    } as TokenInfo;
    const mockQuote = {
      quote: {
        amount: {
          value: BigNumber.from('2000000000000000000'),
          token: {
            symbol: 'DAI',
            address: '0x456',
            chainId: 1,
            decimals: 18,
          },
        } as Amount,
        amountWithMaxSlippage: {} as Amount,
        slippage: 0,
        fees: [{
          recipient: '0x000',
          basisPoints: 100,
          amount: {
            value: BigNumber.from('150000000000000000'),
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
          value: BigNumber.from(100),
        },
      },
      approval: {
        gasFeeEstimate: {
          value: BigNumber.from(50),
        },
      },
    } as TransactionResponse;
    const labelKey = 'conversion.label';

    formatQuoteConversionRate(fromAmount, fromToken, mockQuote, labelKey, mockTranslate as unknown as TFunction);

    expect(mockTranslate).toHaveBeenCalledWith(labelKey, {
      fromSymbol: 'ETH',
      toSymbol: 'DAI',
      rate: '1.33',
      fee: 1,
    });
  });
});

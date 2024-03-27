import { describe } from '@jest/globals';
import { BigNumber } from 'ethers';
import { TransactionResponse } from '@imtbl/dex-sdk';
import { formatSwapFees } from './SwapFees';
import { CryptoFiatState } from '../../../context/crypto-fiat-context/CryptoFiatContext';

describe('formatSwapFees', () => {
  const t = (key) => key; // Mock translation function
  const DEFAULT_DECIMALS = 18; // Default to 18 if your DEFAULT_TOKEN_DECIMALS is similar
  const mockCryptoFiatState: CryptoFiatState = {
    conversions: new Map<string, number>([
      ['eth', 2500], // Example conversion rate
    ]),
  } as CryptoFiatState;

  it('should return an empty array when quoteResult is undefined', () => {
    expect(formatSwapFees(undefined, mockCryptoFiatState, t)).toEqual([]);
  });

  it('should handle gasFeeEstimate correctly', () => {
    const quoteResult = {
      swap: {
        gasFeeEstimate: {
          value: BigNumber.from('100000000000000000'), // 0.1 ETH in wei
          token: {
            symbol: 'ETH',
            decimals: DEFAULT_DECIMALS,
          },
        },
      },
    } as TransactionResponse;
    const fees = formatSwapFees(quoteResult, mockCryptoFiatState, t);
    expect(fees).toHaveLength(1);
    expect(fees[0].label).toBe('drawers.feesBreakdown.fees.gasFeeSwap.label');
    expect(fees[0].fiatAmount).toContain('~ drawers.feesBreakdown.fees.fiatPricePrefix250'); // Assuming calculateCryptoToFiat returns a simplified calculation
  });

  it('should handle gasFeeApprovalEstimate correctly', () => {
    // Similar to the above test but with approval fees
  });

  it('should handle additional fees correctly', () => {
    const quoteResult = {
      quote: {
        fees: [
          {
            amount: {
              value: '100000000000000000', // 0.1 ETH in wei
              token: {
                symbol: 'ETH',
                decimals: DEFAULT_DECIMALS,
              },
            },
          },
        ],
      },
    } as unknown as TransactionResponse;
    const fees = formatSwapFees(quoteResult, mockCryptoFiatState, t);
    expect(fees).toHaveLength(1);
    expect(fees[0].label).toBe('drawers.feesBreakdown.fees.secondarySwapFee.label');
    expect(fees[0].fiatAmount).toContain('drawers.feesBreakdown.fees.fiatPricePrefix250');
  });

  // Add more tests as needed to cover different scenarios, such as:
  // - Multiple fees in the quoteResult.quote.fees array
  // - Handling of different tokens with different decimals
  // - Edge cases like extremely high fees, 0 fees, etc.
});

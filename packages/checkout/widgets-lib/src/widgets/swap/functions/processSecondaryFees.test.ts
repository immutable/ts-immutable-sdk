import {
  Amount,
  Fee,
  Quote,
  TransactionDetails,
  TransactionResponse,
} from '@imtbl/dex-sdk';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { describe } from '@jest/globals';
import { processSecondaryFees } from './processSecondaryFees';

describe('processSecondaryFees', () => {
  const mockQuote = {
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
    approval: null,
    swap: {} as TransactionDetails,
  } as TransactionResponse;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the original quote if no fees are present', () => {
    const fromToken = { symbol: 'ETH', address: '0x123' } as TokenInfo;
    const quote = {
      quote: {},
    } as TransactionResponse;
    expect(processSecondaryFees(fromToken, quote)).toEqual(quote);
  });

  it('should not modify fees with correct symbols', () => {
    const fromToken = { symbol: 'ETH', address: '0x123' } as TokenInfo;
    const quote = mockQuote;

    expect(processSecondaryFees(fromToken, quote)).toEqual(quote);
  });

  it('should add symbol to token without symbol if address matches', () => {
    const fromToken = { symbol: 'ETH', address: '0x123' } as TokenInfo;
    const mockQuoteWithNoSymbol = {
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
              address: '0x123',
              chainId: 1,
              decimals: 18,
            },
          },
        } as Fee],
      } as Quote,
      approval: null,
      swap: {} as TransactionDetails,
    } as TransactionResponse;

    expect(processSecondaryFees(fromToken, mockQuoteWithNoSymbol)).toEqual(mockQuote);
  });

  it('should not add a symbol if token address does not match fromToken address', () => {
    const fromToken = { symbol: 'ETH', address: '0x123' } as TokenInfo;
    const mockQuoteWithDifferentAddress = {
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
              address: '0x000',
              chainId: 1,
              decimals: 18,
            },
          },
        } as Fee],
      } as Quote,
      approval: null,
      swap: {} as TransactionDetails,
    } as TransactionResponse;

    const mockQuoteWithBlankSymbol = {
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
              address: '0x000',
              chainId: 1,
              decimals: 18,
              symbol: undefined,
            },
          },
        } as Fee],
      } as Quote,
      approval: null,
      swap: {} as TransactionDetails,
    } as TransactionResponse;

    expect(processSecondaryFees(fromToken, mockQuoteWithDifferentAddress)).toEqual(mockQuoteWithBlankSymbol);
  });

  it('should handle multiple fees correctly', () => {
    const fromToken = { symbol: 'ETH', address: '0x123' } as TokenInfo;
    const mockQuoteWithMultipleFees = {
      quote: {
        amount: {} as Amount,
        amountWithMaxSlippage: {} as Amount,
        slippage: 0,
        fees: [{
          recipient: '0x456',
          basisPoints: 100,
          amount: {
            value: BigInt(100),
            token: {
              address: '0x000',
              chainId: 1,
              decimals: 18,
            },
          },
        } as Fee,
        {
          recipient: '0x456',
          basisPoints: 100,
          amount: {
            value: BigInt(100),
            token: {
              address: '0x123',
              chainId: 1,
              decimals: 18,
            },
          },
        } as Fee],
      } as Quote,
      approval: null,
      swap: {} as TransactionDetails,
    } as TransactionResponse;

    const mockQuoteWithMultipleFeesResolved = {
      quote: {
        amount: {} as Amount,
        amountWithMaxSlippage: {} as Amount,
        slippage: 0,
        fees: [{
          recipient: '0x456',
          basisPoints: 100,
          amount: {
            value: BigInt(100),
            token: {
              symbol: undefined,
              address: '0x000',
              chainId: 1,
              decimals: 18,
            },
          },
        } as Fee,
        {
          recipient: '0x456',
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
      approval: null,
      swap: {} as TransactionDetails,
    } as TransactionResponse;

    expect(processSecondaryFees(fromToken, mockQuoteWithMultipleFees)).toEqual(mockQuoteWithMultipleFeesResolved);
  });
});

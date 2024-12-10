import { TradeType } from '@uniswap/sdk-core';
import { Pool, Route } from '@uniswap/v3-sdk';
import { formatEther, parseEther } from 'ethers';
import { Fees } from '../fees';
import {
  newAmountFromString,
  expectERC20,
  formatAmount,
  nativeTokenService,
  FUN_TEST_TOKEN,
  makeAddr,
  WIMX_TEST_TOKEN,
  expectNative,
} from '../../test/utils';
import { QuoteResult } from '../getQuotesForRoutes';
import { erc20ToUniswapToken } from '../utils';
import { applySlippage, getOurQuoteReqAmount, prepareUserQuote } from './getQuote';

const DEFAULT_SLIPPAGE = 0.1;
const wimx = erc20ToUniswapToken(WIMX_TEST_TOKEN);
const fun = erc20ToUniswapToken(FUN_TEST_TOKEN);
const testPool = new Pool(wimx, fun, 10000, '79625275426524748796330556128', '10000000000000000', 100);
const route = new Route([testPool], wimx, fun);
const gasEstimate = BigInt(0);

describe('applySlippage', () => {
  describe('when trade type is EXACT_INPUT', () => {
    it('should return a minimum expected amount out', () => {
      const amountInWei = parseEther('100');

      const result = applySlippage(TradeType.EXACT_INPUT, amountInWei, DEFAULT_SLIPPAGE);

      const formattedResult = formatEther(result);

      expect(formattedResult).toEqual('99.900099900099900099');
    });

    describe('AND slippage percent is 0', () => {
      it('should return the same amount', () => {
        const amountInWei = parseEther('100');
        const ZERO_PERCENT = 0;

        const result = applySlippage(TradeType.EXACT_INPUT, amountInWei, ZERO_PERCENT);

        const formattedResult = formatEther(result);

        expect(formattedResult).toEqual('100.0');
      });
    });
  });

  describe('when trade type is EXACT_OUTPUT', () => {
    it('should return a maximum possible amount in', () => {
      const amountOutWei = parseEther('100');

      const result = applySlippage(TradeType.EXACT_OUTPUT, amountOutWei, DEFAULT_SLIPPAGE);

      const formattedResult = formatEther(result);

      expect(formattedResult).toEqual('100.1');
    });

    describe('AND slippage percent is 0', () => {
      it('should return the same amount', () => {
        const amountOutWei = parseEther('100');
        const ZERO_PERCENT = 0;

        const result = applySlippage(TradeType.EXACT_OUTPUT, amountOutWei, ZERO_PERCENT);

        const formattedResult = formatEther(result);

        expect(formattedResult).toEqual('100.0');
      });
    });
  });
});

describe('getOurQuoteReqAmount', () => {
  describe('when trade is EXACT_INPUT, and amountSpecified is native, and no fees', () => {
    it('wraps the amount', () => {
      const amountSpecified = newAmountFromString('1', nativeTokenService.nativeToken);
      const noFees = new Fees([], amountSpecified.token);
      const quoteReqAmount = getOurQuoteReqAmount(amountSpecified, noFees, TradeType.EXACT_INPUT, nativeTokenService);
      expectERC20(quoteReqAmount.token, nativeTokenService.wrappedToken.address);
      expect(formatAmount(quoteReqAmount)).toEqual('1.0');
    });
  });

  describe('when trade is EXACT_OUTPUT, and amountSpecified is native, and no fees', () => {
    it('wraps the amount unchanged', () => {
      const amountSpecified = newAmountFromString('1', nativeTokenService.nativeToken);
      const noFees = new Fees([], FUN_TEST_TOKEN);
      const quoteReqAmount = getOurQuoteReqAmount(amountSpecified, noFees, TradeType.EXACT_OUTPUT, nativeTokenService);
      expectERC20(quoteReqAmount.token, nativeTokenService.wrappedToken.address);
      expect(formatAmount(quoteReqAmount)).toEqual('1.0');
    });
  });

  describe('when the trade is EXACT_INPUT, and amountSpecified is ERC20, and there are fees', () => {
    it('subtracts fees from the amount to request in the quote', () => {
      const amountSpecified = newAmountFromString('1', FUN_TEST_TOKEN);
      const tenPercentFees = new Fees([{ basisPoints: 1000, recipient: makeAddr('hello') }], FUN_TEST_TOKEN);
      const quoteReqAmount = getOurQuoteReqAmount(
        amountSpecified,
        tenPercentFees,
        TradeType.EXACT_INPUT,
        nativeTokenService,
      );
      expectERC20(quoteReqAmount.token, FUN_TEST_TOKEN.address);
      expect(formatAmount(quoteReqAmount)).toEqual('0.9');
    });
  });

  describe('when the trade is EXACT_OUTPUT, and amountSpecified is ERC20, and there are fees', () => {
    it('puts the amount specified unchanged in to the quote request', () => {
      const amountSpecified = newAmountFromString('1', FUN_TEST_TOKEN);
      const tenPercentFees = new Fees([{ basisPoints: 1000, recipient: makeAddr('hello') }], FUN_TEST_TOKEN);
      const quoteReqAmount = getOurQuoteReqAmount(
        amountSpecified,
        tenPercentFees,
        TradeType.EXACT_OUTPUT,
        nativeTokenService,
      );
      expectERC20(quoteReqAmount.token, FUN_TEST_TOKEN.address);
      expect(formatAmount(quoteReqAmount)).toEqual('1.0');
    });
  });
});

describe('prepareUserQuote', () => {
  describe('when the quote is for native currency and exact ERC20 input', () => {
    // Have 1 FUN, want Native IMX
    it('quotes a native amount equal in value to the amountOut', () => {
      const tokenOfQuotedAmount = nativeTokenService.nativeToken;
      const quoteResult: QuoteResult = {
        amountIn: newAmountFromString('1', FUN_TEST_TOKEN),
        amountOut: newAmountFromString('10', WIMX_TEST_TOKEN),
        gasEstimate,
        route,
        tradeType: TradeType.EXACT_INPUT,
      };

      const userQuote = prepareUserQuote(nativeTokenService, quoteResult, DEFAULT_SLIPPAGE, tokenOfQuotedAmount);
      expectNative(userQuote.quotedAmount.token);
      expectNative(userQuote.quotedAmountWithMaxSlippage.token);
      expect(formatAmount(userQuote.quotedAmount)).toEqual('10.0');
    });
  });

  describe('when the quote is for native currency and exact ERC20 output', () => {
    it('quotes a native amount equal in value to the amountOut', () => {
      const tokenOfQuotedAmount = nativeTokenService.nativeToken;
      const quoteResult: QuoteResult = {
        amountIn: newAmountFromString('10', nativeTokenService.wrappedToken),
        amountOut: newAmountFromString('1', FUN_TEST_TOKEN),
        gasEstimate,
        route,
        tradeType: TradeType.EXACT_OUTPUT,
      };

      const userQuote = prepareUserQuote(nativeTokenService, quoteResult, DEFAULT_SLIPPAGE, tokenOfQuotedAmount);
      expectNative(userQuote.quotedAmount.token);
      expectNative(userQuote.quotedAmountWithMaxSlippage.token);
      expect(formatAmount(userQuote.quotedAmount)).toEqual('10.0');
    });
  });

  describe('when the quote is for an erc20 and exact native input', () => {
    // Have 1 native, want FUN
    it('quotes a native amount equal in value to the amountOut', () => {
      const tokenOfQuotedAmount = FUN_TEST_TOKEN;
      const quoteResult: QuoteResult = {
        amountIn: newAmountFromString('1', nativeTokenService.wrappedToken),
        amountOut: newAmountFromString('10', FUN_TEST_TOKEN),
        gasEstimate,
        route,
        tradeType: TradeType.EXACT_INPUT,
      };
      const userQuote = prepareUserQuote(nativeTokenService, quoteResult, DEFAULT_SLIPPAGE, tokenOfQuotedAmount);
      expectERC20(userQuote.quotedAmount.token);
      expectERC20(userQuote.quotedAmountWithMaxSlippage.token);
      expect(formatAmount(userQuote.quotedAmount)).toEqual('10.0');
    });
  });

  describe('when the quote is for the wrapped native and exact erc20 input', () => {
    // Have 1 FUN, want WIMX
    it('quotes a native amount equal in value to the amountOut', () => {
      const tokenOfQuotedAmount = nativeTokenService.wrappedToken;
      const quoteResult: QuoteResult = {
        amountIn: newAmountFromString('1', FUN_TEST_TOKEN),
        amountOut: newAmountFromString('10', nativeTokenService.wrappedToken),
        gasEstimate,
        route,
        tradeType: TradeType.EXACT_INPUT,
      };

      const userQuote = prepareUserQuote(nativeTokenService, quoteResult, DEFAULT_SLIPPAGE, tokenOfQuotedAmount);
      expectERC20(userQuote.quotedAmount.token);
      expectERC20(userQuote.quotedAmountWithMaxSlippage.token);
      expect(formatAmount(userQuote.quotedAmount)).toEqual('10.0');
    });
  });
});

import { BigNumber, ethers } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import {
  expectERC20,
  expectNative,
  formatAmount,
  FUN_TEST_TOKEN,
  newAmountFromString,
  tokenWrapper,
  WIMX_TEST_TOKEN,
} from 'test/utils';
import { Fees } from 'lib/fees';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { Pool, Route } from '@uniswap/v3-sdk';
import { erc20ToUniswapToken } from 'lib/utils';
import { applySlippage, getOurQuoteReqAmount, prepareUserQuote } from './getQuote';

const DEFAULT_SLIPPAGE = 0.1;
const wimx = erc20ToUniswapToken(WIMX_TEST_TOKEN);
const fun = erc20ToUniswapToken(FUN_TEST_TOKEN);
const testPool = new Pool(wimx, fun, 10000, '79625275426524748796330556128', '10000000000000000', 100);
const route = new Route([testPool], wimx, fun);
const gasEstimate = BigNumber.from(0);

describe('applySlippage', () => {
  describe('when trade type is EXACT_INPUT', () => {
    it('should return a minimum expected amount out', () => {
      const amountInWei = ethers.utils.parseEther('100');

      const result = applySlippage(TradeType.EXACT_INPUT, amountInWei, DEFAULT_SLIPPAGE);

      const formattedResult = ethers.utils.formatEther(result);

      expect(formattedResult).toEqual('99.900099900099900099');
    });

    describe('AND slippage percent is 0', () => {
      it('should return the same amount', () => {
        const amountInWei = ethers.utils.parseEther('100');
        const ZERO_PERCENT = 0;

        const result = applySlippage(TradeType.EXACT_INPUT, amountInWei, ZERO_PERCENT);

        const formattedResult = ethers.utils.formatEther(result);

        expect(formattedResult).toEqual('100.0');
      });
    });
  });

  describe('when trade type is EXACT_OUTPUT', () => {
    it('should return a maximum possible amount in', () => {
      const amountOutWei = ethers.utils.parseEther('100');

      const result = applySlippage(TradeType.EXACT_OUTPUT, amountOutWei, DEFAULT_SLIPPAGE);

      const formattedResult = ethers.utils.formatEther(result);

      expect(formattedResult).toEqual('100.1');
    });

    describe('AND slippage percent is 0', () => {
      it('should return the same amount', () => {
        const amountOutWei = ethers.utils.parseEther('100');
        const ZERO_PERCENT = 0;

        const result = applySlippage(TradeType.EXACT_OUTPUT, amountOutWei, ZERO_PERCENT);

        const formattedResult = ethers.utils.formatEther(result);

        expect(formattedResult).toEqual('100.0');
      });
    });
  });
});

describe('getOurQuoteReqAmount', () => {
  describe('when trade is EXACT_INPUT, and amountSpecified is native, and no fees', () => {
    it('wraps the amount', () => {
      const amountSpecified = newAmountFromString('1', tokenWrapper.nativeToken);
      const noFees = new Fees([], tokenWrapper.nativeToken);
      const quoteReqAmount = getOurQuoteReqAmount(amountSpecified, noFees, TradeType.EXACT_INPUT, tokenWrapper);
      expectERC20(quoteReqAmount.token, WIMX_TEST_TOKEN.address);
      expect(formatAmount(quoteReqAmount)).toEqual('1.0');
    });
  });

  describe('when trade is EXACT_OUTPUT, and amountSpecified is native, and no fees', () => {
    it('wraps the amount unchanged', () => {
      const amountSpecified = newAmountFromString('1', tokenWrapper.nativeToken);
      const noFees = new Fees([], tokenWrapper.nativeToken);
      const quoteReqAmount = getOurQuoteReqAmount(amountSpecified, noFees, TradeType.EXACT_OUTPUT, tokenWrapper);
      expectERC20(quoteReqAmount.token, WIMX_TEST_TOKEN.address);
      expect(formatAmount(quoteReqAmount)).toEqual('1.0');
    });
  });
});

describe('prepareUserQuote', () => {
  describe('when the quote is for native currency and exact ERC20 input', () => {
    // Have 1 FUN, want Native IMX
    it('quotes a native amount equal in value to the amountOut', () => {
      const tokenOfQuotedAmount = tokenWrapper.nativeToken;
      const quoteResult: QuoteResult = {
        amountIn: newAmountFromString('1', FUN_TEST_TOKEN),
        amountOut: newAmountFromString('10', WIMX_TEST_TOKEN),
        gasEstimate,
        route,
        tradeType: TradeType.EXACT_INPUT,
      };
      const fees = new Fees([], quoteResult.amountIn.token);
      const userQuote = prepareUserQuote(tokenOfQuotedAmount, quoteResult, DEFAULT_SLIPPAGE, fees, tokenWrapper);
      expectNative(userQuote.amount.token);
      expect(formatAmount(userQuote.amount)).toEqual('10.0');
    });
  });

  describe('when the quote is for native currency and exact ERC20 output', () => {
    // Want 1 FUN, have native IMX
    it('quotes a native amount equal in value to the amountOut', () => {
      const tokenOfQuotedAmount = tokenWrapper.nativeToken;
      const quoteResult: QuoteResult = {
        amountIn: newAmountFromString('10', tokenWrapper.wrappedToken),
        amountOut: newAmountFromString('1', FUN_TEST_TOKEN),
        gasEstimate,
        route,
        tradeType: TradeType.EXACT_OUTPUT,
      };
      const fees = new Fees([], quoteResult.amountIn.token);
      const userQuote = prepareUserQuote(tokenOfQuotedAmount, quoteResult, DEFAULT_SLIPPAGE, fees, tokenWrapper);
      expectNative(userQuote.amount.token);
      expect(formatAmount(userQuote.amount)).toEqual('10.0');
    });
  });

  describe('when the quote is for an erc20 and exact native input', () => {
    // Have 1 native, want FUN
    it('quotes a native amount equal in value to the amountOut', () => {
      const tokenOfQuotedAmount = FUN_TEST_TOKEN;
      const quoteResult: QuoteResult = {
        amountIn: newAmountFromString('1', tokenWrapper.wrappedToken),
        amountOut: newAmountFromString('10', FUN_TEST_TOKEN),
        gasEstimate,
        route,
        tradeType: TradeType.EXACT_INPUT,
      };
      const fees = new Fees([], quoteResult.amountIn.token);
      const userQuote = prepareUserQuote(tokenOfQuotedAmount, quoteResult, DEFAULT_SLIPPAGE, fees, tokenWrapper);
      expectERC20(userQuote.amount.token);
      expect(formatAmount(userQuote.amount)).toEqual('10.0');
    });
  });

  describe('when the quote is for the wrapped native and exact erc20 input', () => {
    // Have 1 FUN, want WIMX
    it('quotes a native amount equal in value to the amountOut', () => {
      const tokenOfQuotedAmount = tokenWrapper.wrappedToken;
      const quoteResult: QuoteResult = {
        amountIn: newAmountFromString('1', FUN_TEST_TOKEN),
        amountOut: newAmountFromString('10', tokenWrapper.wrappedToken),
        gasEstimate,
        route,
        tradeType: TradeType.EXACT_INPUT,
      };
      const fees = new Fees([], quoteResult.amountIn.token);
      const userQuote = prepareUserQuote(tokenOfQuotedAmount, quoteResult, DEFAULT_SLIPPAGE, fees, tokenWrapper);
      expectERC20(userQuote.amount.token);
      expect(formatAmount(userQuote.amount)).toEqual('10.0');
    });
  });
});

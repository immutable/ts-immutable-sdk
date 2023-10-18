import { ethers } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import { Fees } from 'lib/fees';
import {
  newAmountFromString, expectERC20, formatAmount, nativeTokenService, FUN_TEST_TOKEN, makeAddr,
} from 'test/utils';
import { applySlippage, getOurQuoteReqAmount } from './getQuote';

const DEFAULT_SLIPPAGE = 0.1;

describe('applySlippage', () => {
  describe('when trade type is EXACT_INPUT', () => {
    it('should return a minimum expected amount out', () => {
      const amountInWei = ethers.utils.parseEther('100');

      const result = applySlippage(
        TradeType.EXACT_INPUT,
        amountInWei,
        DEFAULT_SLIPPAGE,
      );

      const formattedResult = ethers.utils.formatEther(result);

      expect(formattedResult).toEqual('99.900099900099900099');
    });

    describe('AND slippage percent is 0', () => {
      it('should return the same amount', () => {
        const amountInWei = ethers.utils.parseEther('100');
        const ZERO_PERCENT = 0;

        const result = applySlippage(
          TradeType.EXACT_INPUT,
          amountInWei,
          ZERO_PERCENT,
        );

        const formattedResult = ethers.utils.formatEther(result);

        expect(formattedResult).toEqual('100.0');
      });
    });
  });

  describe('when trade type is EXACT_OUTPUT', () => {
    it('should return a maximum possible amount in', () => {
      const amountOutWei = ethers.utils.parseEther('100');

      const result = applySlippage(
        TradeType.EXACT_OUTPUT,
        amountOutWei,
        DEFAULT_SLIPPAGE,
      );

      const formattedResult = ethers.utils.formatEther(result);

      expect(formattedResult).toEqual('100.1');
    });

    describe('AND slippage percent is 0', () => {
      it('should return the same amount', () => {
        const amountOutWei = ethers.utils.parseEther('100');
        const ZERO_PERCENT = 0;

        const result = applySlippage(
          TradeType.EXACT_OUTPUT,
          amountOutWei,
          ZERO_PERCENT,
        );

        const formattedResult = ethers.utils.formatEther(result);

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

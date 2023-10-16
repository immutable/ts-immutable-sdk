import { ethers, utils } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import {
  NATIVE_IMX_TEST_TOKEN,
  USDC_TEST_TOKEN,
  WIMX_TEST_TOKEN,
  newAmountFromString,
} from 'test/utils';
import { Fees } from 'lib/fees';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { applySlippage, prepareUserQuote } from './getQuote';

const DEFAULT_SLIPPAGE = 0.1;

describe('prepareUserQuote', () => {
  describe('with an exact native input', () => {
    it('should return a quote with the correct amount', () => {
      // Have 100 native IMX, want USDC.
      const quoteResult: Partial<QuoteResult> = {
        amountIn: newAmountFromString('100', WIMX_TEST_TOKEN),
        amountOut: newAmountFromString('1', USDC_TEST_TOKEN),
        tradeType: TradeType.EXACT_INPUT,
      };
      const slippage = 1;
      const fees = new Fees([], WIMX_TEST_TOKEN);
      const quote = prepareUserQuote(
        USDC_TEST_TOKEN,
        quoteResult as any,
        slippage,
        fees,
      );
      expect(quote.amount).toEqual(quoteResult.amountOut);
      expect(quote.amountWithMaxSlippage).toEqual({
        currency: USDC_TEST_TOKEN,
        value: utils.parseUnits('0.990099', USDC_TEST_TOKEN.decimals),
      });
    });
  });

  describe('with an exact native output', () => {
    it('should return a quote with the correct amount', () => {
      // Have 100 USC, want native IMX.
      const quoteResult: Partial<QuoteResult> = {
        amountIn: newAmountFromString('100', USDC_TEST_TOKEN),
        amountOut: newAmountFromString('1', WIMX_TEST_TOKEN),
        tradeType: TradeType.EXACT_INPUT,
      };
      const slippage = 1;
      const fees = new Fees([], WIMX_TEST_TOKEN);
      const quote = prepareUserQuote(
        NATIVE_IMX_TEST_TOKEN,
        quoteResult as any,
        slippage,
        fees,
      );
      expect(quote.amount).toEqual(quoteResult.amountOut);
      expect(quote.amountWithMaxSlippage).toEqual({
        currency: NATIVE_IMX_TEST_TOKEN,
        value: utils.parseUnits('0.990099009900990099', NATIVE_IMX_TEST_TOKEN.decimals),
      });
    });
  });
});

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

import { BigNumber } from 'ethers';
import { TradeType, Currency } from '@uniswap/sdk-core';
import { QuoteTradeInfo } from 'lib';
import { FUN_TEST_TOKEN, IMX_TEST_TOKEN, TEST_FEE_RECIPIENT } from 'test/utils';
import { Pool, Route } from '@uniswap/v3-sdk';
import { Fees } from 'lib/fees';
import { prepareSwap } from './swap';

const testPool = new Pool(
  IMX_TEST_TOKEN,
  FUN_TEST_TOKEN,
  10000,
  '79625275426524748796330556128',
  '10000000000000000',
  100,
);

describe('prepareSwap', () => {
  describe('when the trade type is exact input', () => {
    it('should use the specified amount for the amountIn', async () => {
      const amountSpecified = BigNumber.from('10000000000');
      const quotedAmount = BigNumber.from('20000000000');
      const route: Route<Currency, Currency> = new Route([testPool], IMX_TEST_TOKEN, FUN_TEST_TOKEN);
      const quote: QuoteTradeInfo = {
        gasEstimate: BigNumber.from(0),
        route,
        tokenIn: IMX_TEST_TOKEN,
        tokenOut: FUN_TEST_TOKEN,
        amountIn: amountSpecified,
        amountOut: quotedAmount,
        tradeType: TradeType.EXACT_INPUT,
      };

      const preparedSwap = prepareSwap(quote, amountSpecified, new Fees([], IMX_TEST_TOKEN));

      expect(preparedSwap.amountIn.toString()).toEqual(amountSpecified.toString());
    });

    it('should use the quoted amount for the amountOut', async () => {
      const amountSpecified = BigNumber.from('10000000000');
      const quotedAmount = BigNumber.from('20000000000');
      const route: Route<Currency, Currency> = new Route([testPool], IMX_TEST_TOKEN, FUN_TEST_TOKEN);
      const quote: QuoteTradeInfo = {
        gasEstimate: BigNumber.from(0),
        route,
        tokenIn: IMX_TEST_TOKEN,
        tokenOut: FUN_TEST_TOKEN,
        amountIn: amountSpecified,
        amountOut: quotedAmount,
        tradeType: TradeType.EXACT_INPUT,
      };

      const preparedSwap = prepareSwap(quote, amountSpecified, new Fees([], IMX_TEST_TOKEN));

      expect(preparedSwap.amountOut.toString()).toEqual(quotedAmount.toString());
    });

    describe('with fees', () => {
      it('does not apply fees to any amount', async () => {
        const amountSpecified = BigNumber.from('10000000000');
        const quotedAmount = BigNumber.from('20000000000');
        const route: Route<Currency, Currency> = new Route([testPool], IMX_TEST_TOKEN, FUN_TEST_TOKEN);
        const quote: QuoteTradeInfo = {
          gasEstimate: BigNumber.from(0),
          route,
          tokenIn: IMX_TEST_TOKEN,
          tokenOut: FUN_TEST_TOKEN,
          amountIn: amountSpecified,
          amountOut: quotedAmount,
          tradeType: TradeType.EXACT_INPUT,
        };

        const preparedSwap = prepareSwap(
          quote,
          amountSpecified,
          new Fees([{ feeRecipient: TEST_FEE_RECIPIENT, feeBasisPoints: 1000 }], IMX_TEST_TOKEN), // 1% fee
        );

        expect(preparedSwap.amountIn.toString()).toEqual(amountSpecified.toString());
        expect(preparedSwap.amountOut.toString()).toEqual(quotedAmount.toString());
      });
    });
  });

  describe('when the trade type is exact output', () => {
    it('should use the quoted amount for the amountIn', async () => {
      const amountSpecified = BigNumber.from('10000000000');
      const quotedAmount = BigNumber.from('20000000000');
      const route: Route<Currency, Currency> = new Route([testPool], IMX_TEST_TOKEN, FUN_TEST_TOKEN);
      const quote: QuoteTradeInfo = {
        gasEstimate: BigNumber.from(0),
        route,
        tokenIn: IMX_TEST_TOKEN,
        tokenOut: FUN_TEST_TOKEN,
        amountIn: quotedAmount,
        amountOut: amountSpecified,
        tradeType: TradeType.EXACT_OUTPUT,
      };

      const preparedSwap = prepareSwap(quote, amountSpecified, new Fees([], IMX_TEST_TOKEN));

      expect(preparedSwap.amountIn.toString()).toEqual(quotedAmount.toString());
    });

    it('should use the specified amount for the amountOut', async () => {
      const amountSpecified = BigNumber.from('10000000000');
      const quotedAmount = BigNumber.from('20000000000');
      const route: Route<Currency, Currency> = new Route([testPool], IMX_TEST_TOKEN, FUN_TEST_TOKEN);
      const quote: QuoteTradeInfo = {
        gasEstimate: BigNumber.from(0),
        route,
        tokenIn: IMX_TEST_TOKEN,
        tokenOut: FUN_TEST_TOKEN,
        amountIn: quotedAmount,
        amountOut: amountSpecified,
        tradeType: TradeType.EXACT_OUTPUT,
      };

      const preparedSwap = prepareSwap(quote, amountSpecified, new Fees([], IMX_TEST_TOKEN));

      expect(preparedSwap.amountOut.toString()).toEqual(amountSpecified.toString());
    });

    describe('with fees', () => {
      it('applies fees to the quoted amount', async () => {
        const amountSpecified = BigNumber.from('10000000000');
        const quotedAmount = BigNumber.from('20000000000');
        const route: Route<Currency, Currency> = new Route([testPool], IMX_TEST_TOKEN, FUN_TEST_TOKEN);
        const quote: QuoteTradeInfo = {
          gasEstimate: BigNumber.from(0),
          route,
          tokenIn: IMX_TEST_TOKEN,
          tokenOut: FUN_TEST_TOKEN,
          amountIn: quotedAmount,
          amountOut: amountSpecified,
          tradeType: TradeType.EXACT_OUTPUT,
        };

        const preparedSwap = prepareSwap(
          quote,
          amountSpecified,
          new Fees([{ feeRecipient: TEST_FEE_RECIPIENT, feeBasisPoints: 1000 }], IMX_TEST_TOKEN), // 1% fee
        );

        expect(preparedSwap.amountIn.toString()).toEqual('22000000000'); // quotedAmount + 1% fee
        expect(preparedSwap.amountOut.toString()).toEqual(amountSpecified.toString());
      });
    });
  });
});

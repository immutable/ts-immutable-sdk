import { BigNumber, utils } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import {
  FUN_TEST_TOKEN, IMX_TEST_TOKEN, TEST_FEE_RECIPIENT,
  decodeMulticallExactInputSingleWithFees, decodeMulticallExactInputSingleWithoutFees,
  decodeMulticallExactOutputSingleWithFees, decodeMulticallExactOutputSingleWithoutFees,
  expectInstanceOf, expectToBeDefined, makeAddr,
} from 'test/utils';
import { Pool, Route } from '@uniswap/v3-sdk';
import { Fees } from 'lib/fees';
import { QuoteTradeInfo, newAmount } from 'lib';
import { getSwap, prepareSwap } from './swap';

const testPool = new Pool(
  IMX_TEST_TOKEN,
  FUN_TEST_TOKEN,
  10000,
  '79625275426524748796330556128',
  '10000000000000000',
  100,
);

const buildExactInputQuote = (): QuoteTradeInfo => {
  const route = new Route([testPool], IMX_TEST_TOKEN, FUN_TEST_TOKEN);
  return {
    gasEstimate: BigNumber.from(0),
    route,
    amountIn: newAmount(utils.parseEther('99'), route.input),
    amountOut: newAmount(utils.parseEther('990'), route.output),
    tradeType: TradeType.EXACT_INPUT,
  };
};

const buildExactOutputQuote = (): QuoteTradeInfo => {
  const route = new Route([testPool], IMX_TEST_TOKEN, FUN_TEST_TOKEN);
  return {
    gasEstimate: BigNumber.from(0),
    route,
    amountIn: newAmount(utils.parseEther('100'), route.input),
    amountOut: newAmount(utils.parseEther('9910000'), route.output),
    tradeType: TradeType.EXACT_OUTPUT,
  };
};

describe('getSwap', () => {
  describe('without fees', () => {
    it('subtracts inverted slippage to calculate the amountOutMinimum', () => {
      const quote = buildExactInputQuote();
      quote.amountOut.value = utils.parseEther('990');

      const swap = getSwap(
        IMX_TEST_TOKEN,
        quote,
        makeAddr('fromAddress'),
        3,
        0,
        makeAddr('periphery'),
        makeAddr('secondaryFeeContract'),
        BigNumber.from(0),
        [],
      );

      expectToBeDefined(swap.transaction.data);
      const { swapParams } = decodeMulticallExactInputSingleWithoutFees(swap.transaction.data);

      expectInstanceOf(BigNumber, swapParams.amountOutMinimum);
      expect(utils.formatEther(swapParams.amountOutMinimum)).toEqual('961.165048543689320388');
    });

    it('adds non-inverted slippage to calculate the amountInMaximum', () => {
      const quote = buildExactOutputQuote();
      quote.amountIn.value = utils.parseEther('100');

      const swap = getSwap(
        IMX_TEST_TOKEN,
        quote,
        makeAddr('fromAddress'),
        3,
        0,
        makeAddr('periphery'),
        makeAddr('secondaryFeeContract'),
        BigNumber.from(0),
        [],
      );

      expectToBeDefined(swap.transaction.data);
      const { swapParams } = decodeMulticallExactOutputSingleWithoutFees(swap.transaction.data);

      expectInstanceOf(BigNumber, swapParams.amountInMaximum);
      expect(utils.formatEther(swapParams.amountInMaximum)).toEqual('103.0');
    });
  });

  describe('with fees', () => {
    it('subtracts inverted slippage to calculate the amountOutMinimum', () => {
      const quote = buildExactInputQuote();
      quote.amountOut.value = utils.parseEther('990');

      const swap = getSwap(
        IMX_TEST_TOKEN,
        quote,
        makeAddr('fromAddress'),
        3,
        0,
        makeAddr('periphery'),
        makeAddr('secondaryFeeContract'),
        BigNumber.from(0),
        [{ feeBasisPoints: 100, feeRecipient: makeAddr('feeRecipient') }],
      );

      expectToBeDefined(swap.transaction.data);
      const { swapParams } = decodeMulticallExactInputSingleWithFees(swap.transaction.data);

      expectInstanceOf(BigNumber, swapParams.amountOutMinimum);
      expect(utils.formatEther(swapParams.amountOutMinimum)).toEqual('961.165048543689320388');
    });

    it('adds non-inverted slippage to calculate the amountInMaximum', () => {
      const quote = buildExactOutputQuote();
      quote.amountIn.value = utils.parseEther('100');

      const swap = getSwap(
        IMX_TEST_TOKEN,
        quote,
        makeAddr('fromAddress'),
        3,
        0,
        makeAddr('periphery'),
        makeAddr('secondaryFeeContract'),
        BigNumber.from(0),
        [{ feeBasisPoints: 100, feeRecipient: makeAddr('feeRecipient') }],
      );

      expectToBeDefined(swap.transaction.data);
      const { swapParams } = decodeMulticallExactOutputSingleWithFees(swap.transaction.data);

      expectInstanceOf(BigNumber, swapParams.amountInMaximum);
      expect(utils.formatEther(swapParams.amountInMaximum)).toEqual('103.0');
    });
  });
});

describe('prepareSwap', () => {
  describe('when the trade type is exact input', () => {
    it('should use the specified amount for the amountIn', async () => {
      const quote = buildExactInputQuote();

      const preparedSwap = prepareSwap(quote, quote.amountIn, new Fees([], IMX_TEST_TOKEN));

      expect(preparedSwap.amountIn.toString()).toEqual(quote.amountIn.toString());
    });

    it('should use the quoted amount for the amountOut', async () => {
      const quote = buildExactInputQuote();

      const preparedSwap = prepareSwap(quote, quote.amountIn, new Fees([], IMX_TEST_TOKEN));

      expect(preparedSwap.amountOut.toString()).toEqual(quote.amountOut.toString());
    });

    describe('with fees', () => {
      it('does not apply fees to any amount', async () => {
        const quote = buildExactInputQuote();

        const preparedSwap = prepareSwap(
          quote,
          quote.amountIn,
          new Fees([{ feeRecipient: TEST_FEE_RECIPIENT, feeBasisPoints: 1000 }], IMX_TEST_TOKEN), // 1% fee
        );

        expect(preparedSwap.amountIn.toString()).toEqual(quote.amountIn.toString());
        expect(preparedSwap.amountOut.toString()).toEqual(quote.amountOut.toString());
      });
    });
  });

  describe('when the trade type is exact output', () => {
    it('should use the quoted amount for the amountIn', async () => {
      const quote = buildExactOutputQuote();

      const preparedSwap = prepareSwap(quote, quote.amountOut, new Fees([], IMX_TEST_TOKEN));

      expect(preparedSwap.amountIn.toString()).toEqual(quote.amountIn.toString());
    });

    it('should use the specified amount for the amountOut', async () => {
      const quote = buildExactOutputQuote();

      const preparedSwap = prepareSwap(quote, quote.amountOut, new Fees([], IMX_TEST_TOKEN));

      expect(preparedSwap.amountOut.toString()).toEqual(quote.amountOut.toString());
    });

    describe('with fees', () => {
      it('applies fees to the quoted amount', async () => {
        const quote = buildExactOutputQuote();
        quote.amountOut.value = utils.parseEther('100');

        const preparedSwap = prepareSwap(
          quote,
          quote.amountOut,
          new Fees([{ feeRecipient: TEST_FEE_RECIPIENT, feeBasisPoints: 1000 }], IMX_TEST_TOKEN), // 1% fee
        );

        expect(utils.formatEther(preparedSwap.amountIn.value)).toEqual('110.0'); // quotedAmount + 1% fee
        expect(preparedSwap.amountOut.toString()).toEqual(quote.amountOut.toString());
      });
    });
  });
});

import { BigNumber, utils } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import {
  FUN_TEST_TOKEN, WIMX_TEST_TOKEN, TEST_FEE_RECIPIENT,
  decodeMulticallExactInputSingleWithFees, decodeMulticallExactInputSingleWithoutFees,
  decodeMulticallExactOutputSingleWithFees, decodeMulticallExactOutputSingleWithoutFees,
  expectInstanceOf, expectToBeDefined, makeAddr, formatAmount, newAmountFromString, NATIVE_TEST_TOKEN,
} from 'test/utils';
import { Pool, Route } from '@uniswap/v3-sdk';
import { Fees } from 'lib/fees';
import { erc20ToUniswapToken, newAmount, uniswapTokenToERC20 } from 'lib';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { getSwap, adjustQuoteWithFees } from './swap';

const wimx = erc20ToUniswapToken(WIMX_TEST_TOKEN);
const fun = erc20ToUniswapToken(FUN_TEST_TOKEN);

const testPool = new Pool(
  wimx,
  fun,
  10000,
  '79625275426524748796330556128',
  '10000000000000000',
  100,
);

const buildExactInputQuote = (): QuoteResult => {
  const route = new Route([testPool], wimx, fun);
  return {
    gasEstimate: BigNumber.from(0),
    route,
    amountIn: newAmountFromString('99', uniswapTokenToERC20(route.input)),
    amountOut: newAmountFromString('990', uniswapTokenToERC20(route.output)),
    tradeType: TradeType.EXACT_INPUT,
  };
};

const buildExactOutputQuote = (): QuoteResult => {
  const route = new Route([testPool], wimx, fun);
  return {
    gasEstimate: BigNumber.from(0),
    route,
    amountIn: newAmountFromString('100', uniswapTokenToERC20(route.input)),
    amountOut: newAmountFromString('1000', uniswapTokenToERC20(route.output)),
    tradeType: TradeType.EXACT_OUTPUT,
  };
};

describe('getSwap', () => {
  describe('without fees', () => {
    it('subtracts inverted slippage to calculate the amountOutMinimum', () => {
      const quote = buildExactInputQuote();
      quote.amountOut.value = utils.parseEther('990');

      const swap = getSwap(
        quote,
        makeAddr('fromAddress'),
        3,
        0,
        makeAddr('periphery'),
        makeAddr('secondaryFeeContract'),
        newAmount(BigNumber.from(0), NATIVE_TEST_TOKEN),
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
        quote,
        makeAddr('fromAddress'),
        3,
        0,
        makeAddr('periphery'),
        makeAddr('secondaryFeeContract'),
        newAmount(BigNumber.from(0), NATIVE_TEST_TOKEN),
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
        quote,
        makeAddr('fromAddress'),
        3,
        0,
        makeAddr('periphery'),
        makeAddr('secondaryFeeContract'),
        newAmount(BigNumber.from(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
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
        quote,
        makeAddr('fromAddress'),
        3,
        0,
        makeAddr('periphery'),
        makeAddr('secondaryFeeContract'),
        newAmount(BigNumber.from(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
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

      const preparedSwap = adjustQuoteWithFees(quote, quote.amountIn, new Fees([], WIMX_TEST_TOKEN), WIMX_TEST_TOKEN);

      expect(formatAmount(preparedSwap.amountIn)).toEqual(formatAmount(quote.amountIn));
    });

    it('should use the quoted amount for the amountOut', async () => {
      const quote = buildExactInputQuote();

      const preparedSwap = adjustQuoteWithFees(quote, quote.amountIn, new Fees([], WIMX_TEST_TOKEN), WIMX_TEST_TOKEN);

      expect(formatAmount(preparedSwap.amountOut)).toEqual(formatAmount(quote.amountOut));
    });

    describe('with fees', () => {
      it('does not apply fees to any amount', async () => {
        const quote = buildExactInputQuote();

        const preparedSwap = adjustQuoteWithFees(
          quote,
          quote.amountIn,
          new Fees([{ recipient: TEST_FEE_RECIPIENT, basisPoints: 1000 }], WIMX_TEST_TOKEN), // 1% fee
          WIMX_TEST_TOKEN,
        );

        expect(formatAmount(preparedSwap.amountIn)).toEqual(formatAmount(quote.amountIn));
        expect(formatAmount(preparedSwap.amountOut)).toEqual(formatAmount(quote.amountOut));
      });
    });
  });

  describe('when the trade type is exact output', () => {
    it('should use the quoted amount for the amountIn', async () => {
      const quote = buildExactOutputQuote();

      const preparedSwap = adjustQuoteWithFees(quote, quote.amountOut, new Fees([], WIMX_TEST_TOKEN), WIMX_TEST_TOKEN);

      expect(formatAmount(preparedSwap.amountIn)).toEqual(formatAmount(quote.amountIn));
    });

    it('should use the specified amount for the amountOut', async () => {
      const quote = buildExactOutputQuote();

      const preparedSwap = adjustQuoteWithFees(quote, quote.amountOut, new Fees([], WIMX_TEST_TOKEN), WIMX_TEST_TOKEN);

      expect(formatAmount(preparedSwap.amountOut)).toEqual(formatAmount(quote.amountOut));
    });

    describe('with fees', () => {
      it('applies fees to the quoted amount', async () => {
        const quote = buildExactOutputQuote();
        quote.amountOut.value = utils.parseEther('100');

        const preparedSwap = adjustQuoteWithFees(
          quote,
          quote.amountOut,
          new Fees([{ recipient: TEST_FEE_RECIPIENT, basisPoints: 1000 }], WIMX_TEST_TOKEN), // 1% fee
          WIMX_TEST_TOKEN,
        );

        expect(formatAmount(preparedSwap.amountIn)).toEqual('110.0'); // quotedAmount + 1% fee
        expect(formatAmount(preparedSwap.amountOut)).toEqual(formatAmount(quote.amountOut));
      });
    });
  });
});

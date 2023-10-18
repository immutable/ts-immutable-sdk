import { BigNumber, utils } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import {
  FUN_TEST_TOKEN,
  IMX_TEST_TOKEN,
  TEST_FEE_RECIPIENT,
  decodeMulticallExactInputSingleWithFees,
  decodeMulticallExactInputSingleWithoutFees,
  decodeMulticallExactOutputSingleWithFees,
  decodeMulticallExactOutputSingleWithoutFees,
  expectInstanceOf,
  expectToBeDefined,
  makeAddr,
  formatAmount,
  newAmountFromString,
  nativeTokenService,
  NATIVE_TEST_TOKEN,
  expectERC20,
} from 'test/utils';
import { Pool, Route } from '@uniswap/v3-sdk';
import { Fees } from 'lib/fees';
import { Coin, erc20ToUniswapToken, newAmount, uniswapTokenToERC20 } from 'lib';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { getSwap, adjustQuoteWithFees } from './swap';

const UNISWAP_IMX = erc20ToUniswapToken(IMX_TEST_TOKEN);
const UNISWAP_FUN = erc20ToUniswapToken(FUN_TEST_TOKEN);

const testPool = new Pool(UNISWAP_IMX, UNISWAP_FUN, 10000, '79625275426524748796330556128', '10000000000000000', 100);

const route = new Route([testPool], UNISWAP_IMX, UNISWAP_FUN);
const gasEstimate = BigNumber.from(0);

const tenPercentFees = (tokenIn: Coin): Fees =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Fees([{ recipient: TEST_FEE_RECIPIENT, basisPoints: 1000 }], tokenIn);

const buildExactInputQuote = (): QuoteResult => ({
  gasEstimate,
  route,
  amountIn: newAmountFromString('99', uniswapTokenToERC20(route.input)),
  amountOut: newAmountFromString('990', uniswapTokenToERC20(route.output)),
  tradeType: TradeType.EXACT_INPUT,
});

const buildExactOutputQuote = (): QuoteResult => ({
  gasEstimate,
  route,
  amountIn: newAmountFromString('100', uniswapTokenToERC20(route.input)),
  amountOut: newAmountFromString('1000', uniswapTokenToERC20(route.output)),
  tradeType: TradeType.EXACT_OUTPUT,
});

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

describe('adjustQuoteWithFees', () => {
  describe('when the trade type is exact input', () => {
    it('should use the specified amount for the amountIn', async () => {
      const quote = buildExactInputQuote();
      const userSpecifiedAmountIn = newAmountFromString('100', quote.amountIn.token);

      const preparedSwap = adjustQuoteWithFees(
        quote,
        userSpecifiedAmountIn,
        new Fees([], userSpecifiedAmountIn.token),
        nativeTokenService,
      );

      expect(formatAmount(preparedSwap.amountIn)).toEqual(formatAmount(userSpecifiedAmountIn));
    });

    it('should use the quoted amount for the amountOut', async () => {
      const quote = buildExactInputQuote();
      const userSpecifiedAmountIn = newAmountFromString('100', quote.amountIn.token);

      const preparedSwap = adjustQuoteWithFees(
        quote,
        userSpecifiedAmountIn,
        new Fees([], userSpecifiedAmountIn.token),
        nativeTokenService,
      );

      expect(formatAmount(preparedSwap.amountOut)).toEqual(formatAmount(quote.amountOut));
    });

    describe('with fees', () => {
      it('does not apply fees to any amount', async () => {
        const quote = buildExactInputQuote();
        const userSpecifiedAmountIn = newAmountFromString('100', quote.amountIn.token);

        const preparedSwap = adjustQuoteWithFees(
          quote,
          userSpecifiedAmountIn,
          new Fees([{ recipient: TEST_FEE_RECIPIENT, basisPoints: 1000 }], userSpecifiedAmountIn.token), // 1% fee
          nativeTokenService,
        );

        expect(formatAmount(preparedSwap.amountIn)).toEqual(formatAmount(userSpecifiedAmountIn));
        expect(formatAmount(preparedSwap.amountOut)).toEqual(formatAmount(quote.amountOut));
      });
    });

    describe('when the user specified tokenIn is native', () => {
      it('wraps it and uses it as the amountIn', () => {
        const quote: QuoteResult = {
          gasEstimate,
          route,
          amountIn: newAmountFromString('9', nativeTokenService.wrappedToken), // has been wrapped
          amountOut: newAmountFromString('1', FUN_TEST_TOKEN),
          tradeType: TradeType.EXACT_INPUT,
        };
        const userSpecifiedAmountIn = newAmountFromString('10', nativeTokenService.nativeToken);

        const preparedSwap = adjustQuoteWithFees(
          quote,
          userSpecifiedAmountIn,
          new Fees([], userSpecifiedAmountIn.token),
          nativeTokenService,
        );

        expect(formatAmount(preparedSwap.amountIn)).toEqual('10.0');
      });
    });
  });

  describe('when the trade type is exact output', () => {
    it('should use the quoted amount for the amountIn', async () => {
      const quote = buildExactOutputQuote();
      // In this case, the user-specified amount is always equal to the amountOut in the quote
      const userSpecifiedAmountOut = quote.amountOut;

      const preparedSwap = adjustQuoteWithFees(
        quote,
        userSpecifiedAmountOut,
        new Fees([], quote.amountIn.token),
        nativeTokenService,
      );

      expect(formatAmount(preparedSwap.amountIn)).toEqual(formatAmount(quote.amountIn));
    });

    it('should use the amountOut from the quote for the amountOut', async () => {
      const quote = buildExactOutputQuote();
      // In this case, the user-specified amount is always equal to the amountOut in the quote
      const userSpecifiedAmountOut = quote.amountOut;

      const preparedSwap = adjustQuoteWithFees(
        quote,
        userSpecifiedAmountOut,
        new Fees([], quote.amountIn.token),
        nativeTokenService,
      );

      expect(formatAmount(preparedSwap.amountOut)).toEqual(formatAmount(quote.amountOut));
    });

    describe('with fees', () => {
      it('applies fees to the quoted amount', async () => {
        const quote = buildExactOutputQuote();
        quote.amountOut.value = utils.parseEther('100');
        // In this case, the user-specified amount is always equal to the amountOut in the quote
        const userSpecifiedAmountOut = quote.amountOut;

        const preparedSwap = adjustQuoteWithFees(
          quote,
          userSpecifiedAmountOut,
          new Fees([{ recipient: TEST_FEE_RECIPIENT, basisPoints: 1000 }], quote.amountIn.token), // 10% fee
          nativeTokenService,
        );

        expect(formatAmount(preparedSwap.amountIn)).toEqual('110.0'); // quotedAmount + 1% fee
        expect(formatAmount(preparedSwap.amountOut)).toEqual(formatAmount(quote.amountOut));
      });
    });

    describe('when the tokenIn is native', () => {
      // Want to buy 1 FUN in exchange for native IMX
      it('applies fees to the amountIn', () => {
        const quote: QuoteResult = {
          gasEstimate,
          route,
          amountIn: newAmountFromString('10', nativeTokenService.wrappedToken), // has been wrapped
          amountOut: newAmountFromString('1', FUN_TEST_TOKEN),
          tradeType: TradeType.EXACT_OUTPUT,
        };
        const userSpecifiedAmountOut = quote.amountOut;

        const fees = tenPercentFees(NATIVE_TEST_TOKEN);
        const preparedSwap = adjustQuoteWithFees(quote, userSpecifiedAmountOut, fees, nativeTokenService);

        expectERC20(preparedSwap.amountIn.token, nativeTokenService.wrappedToken.address);
        expect(formatAmount(preparedSwap.amountIn)).toEqual('11.0');

        expectERC20(preparedSwap.amountOut.token, FUN_TEST_TOKEN.address);
        expect(formatAmount(preparedSwap.amountOut)).toEqual('1.0');
      });
    });
  });
});

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
  WIMX_TEST_TOKEN,
  formatEther,
} from 'test/utils';
import { Pool, Route } from '@uniswap/v3-sdk';
import { Fees } from 'lib/fees';
import { erc20ToUniswapToken, newAmount } from 'lib';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { Coin, ERC20 } from 'types';
import { getSwap, adjustQuoteWithFees } from './swap';

const gasEstimate = BigNumber.from(0);
const slippagePercentage = 3;
const deadline = 0;

const buildRoute = (tokenIn: ERC20, tokenOut: ERC20) => {
  const uniswapTokenIn = erc20ToUniswapToken(tokenIn);
  const uniswapTokenOut = erc20ToUniswapToken(tokenOut);
  const pool = new Pool(
    uniswapTokenIn,
    uniswapTokenOut,
    10000,
    '79625275426524748796330556128',
    '10000000000000000',
    100,
  );
  return new Route([pool], uniswapTokenIn, uniswapTokenOut);
};

const buildExactInputQuote = (tokenIn = IMX_TEST_TOKEN, tokenOut = FUN_TEST_TOKEN): QuoteResult => ({
  gasEstimate,
  route: buildRoute(tokenIn, tokenOut),
  amountIn: newAmountFromString('99', tokenIn),
  amountOut: newAmountFromString('990', tokenOut),
  tradeType: TradeType.EXACT_INPUT,
});

const buildExactOutputQuote = (tokenIn = IMX_TEST_TOKEN, tokenOut = FUN_TEST_TOKEN): QuoteResult => ({
  gasEstimate,
  route: buildRoute(tokenIn, tokenOut),
  amountIn: newAmountFromString('100', tokenIn),
  amountOut: newAmountFromString('1000', tokenOut),
  tradeType: TradeType.EXACT_OUTPUT,
});

const tenPercentFees = (tokenIn: Coin): Fees =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Fees([{ recipient: TEST_FEE_RECIPIENT, basisPoints: 1000 }], tokenIn);

describe('getSwap', () => {
  describe('without fees', () => {
    it('subtracts inverted slippage to calculate the amountOutMinimum', () => {
      const quote = buildExactInputQuote();
      quote.amountOut.value = utils.parseEther('990');

      const swap = getSwap(
        quote.amountIn.token,
        quote.amountOut.token,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
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
        quote.amountIn.token,
        quote.amountOut.token,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
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
        quote.amountIn.token,
        quote.amountOut.token,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
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
        quote.amountIn.token,
        quote.amountOut.token,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
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

  describe('with EXACT_INPUT + native amount in', () => {
    it('uses the amountSpecified as the transaction value', () => {
      const originalTokenIn = nativeTokenService.nativeToken;
      const originalTokenOut = FUN_TEST_TOKEN;
      const quote = buildExactInputQuote(nativeTokenService.wrappedToken, FUN_TEST_TOKEN);
      quote.amountIn.value = utils.parseEther('99');

      const swap = getSwap(
        originalTokenIn,
        originalTokenOut,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('secondaryFeeContract'),
        newAmount(BigNumber.from(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expect(formatEther(BigNumber.from(swap.transaction.value))).toEqual('99.0');
    });
  });

  describe('with EXACT_INPUT + native amount out', () => {
    it('sets a transaction value of zero', () => {
      const originalTokenIn = FUN_TEST_TOKEN;
      const originalTokenOut = NATIVE_TEST_TOKEN;
      const quote = buildExactInputQuote(FUN_TEST_TOKEN, nativeTokenService.wrappedToken);

      const swap = getSwap(
        originalTokenIn,
        originalTokenOut,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('secondaryFeeContract'),
        newAmount(BigNumber.from(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expect(swap.transaction.value).toEqual('0x00');
    });
  });

  describe('with EXACT_OUTPUT + native amount in', () => {
    it('sets the transaction value to the max amount in including slippage', () => {
      const originalTokenIn = nativeTokenService.nativeToken;
      const originalTokenOut = FUN_TEST_TOKEN;
      const quote = buildExactOutputQuote(nativeTokenService.wrappedToken, FUN_TEST_TOKEN);
      quote.amountIn.value = utils.parseEther('100');

      const swap = getSwap(
        originalTokenIn,
        originalTokenOut,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('secondaryFeeContract'),
        newAmount(BigNumber.from(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expect(formatEther(BigNumber.from(swap.transaction.value))).toEqual('103.0');
    });
  });

  describe('with EXACT_OUTPUT + native amount out', () => {
    it('sets a transaction value of zero', () => {
      const originalTokenIn = FUN_TEST_TOKEN;
      const originalTokenOut = NATIVE_TEST_TOKEN;
      const quote = buildExactOutputQuote(FUN_TEST_TOKEN, nativeTokenService.wrappedToken);

      const swap = getSwap(
        originalTokenIn,
        originalTokenOut,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('secondaryFeeContract'),
        newAmount(BigNumber.from(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expect(swap.transaction.value).toEqual('0x00');
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
          route: buildRoute(WIMX_TEST_TOKEN, FUN_TEST_TOKEN),
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
          route: buildRoute(WIMX_TEST_TOKEN, FUN_TEST_TOKEN),
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

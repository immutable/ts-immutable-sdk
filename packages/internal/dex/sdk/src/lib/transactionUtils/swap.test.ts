import { TradeType } from '@uniswap/sdk-core';
import { Pool, Route } from '@uniswap/v3-sdk';
import {
  FUN_TEST_TOKEN,
  IMX_TEST_TOKEN,
  TEST_FEE_RECIPIENT,
  decodeMulticallExactInputSingleWithFees,
  decodeMulticallExactInputSingleWithoutFees,
  decodeMulticallExactOutputSingleWithFees,
  decodeMulticallExactOutputSingleWithoutFees,
  expectToBeDefined,
  makeAddr,
  formatAmount,
  newAmountFromString,
  nativeTokenService,
  NATIVE_TEST_TOKEN,
  expectERC20,
  WIMX_TEST_TOKEN,
  formatEther,
  USDC_TEST_TOKEN,
  decodeMulticallExactInputWithFees,
  decodeMulticallExactOutputWithFees,
  expectToBeString,
} from '../../test/utils';
import { Fees } from '../fees';
import { erc20ToUniswapToken, newAmount } from '../utils';
import { QuoteResult } from '../getQuotesForRoutes';
import { Coin, ERC20 } from '../../types';
import { getSwap, adjustQuoteWithFees } from './swap';
import { parseEther } from 'ethers';

const gasEstimate = BigInt(0);
const slippagePercentage = 3;
const deadline = 0;

const buildSinglePoolRoute = (tokenIn: ERC20, tokenOut: ERC20) => {
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

const buildMultiPoolRoute = (tokenIn: ERC20, tokenMiddle: ERC20, tokenOut: ERC20) => {
  const uniswapTokenIn = erc20ToUniswapToken(tokenIn);
  const uniswapTokenMiddle = erc20ToUniswapToken(tokenMiddle);
  const uniswapTokenOut = erc20ToUniswapToken(tokenOut);
  const firstPool = new Pool(
    uniswapTokenIn,
    uniswapTokenMiddle,
    10000,
    '79625275426524748796330556128',
    '10000000000000000',
    100,
  );
  const secondPool = new Pool(
    uniswapTokenMiddle,
    uniswapTokenOut,
    10000,
    '79625275426524748796330556128',
    '10000000000000000',
    100,
  );
  return new Route([firstPool, secondPool], uniswapTokenIn, uniswapTokenOut);
};

const buildExactInputQuote = (tokenIn = IMX_TEST_TOKEN, tokenOut = FUN_TEST_TOKEN): QuoteResult => ({
  gasEstimate,
  route: buildSinglePoolRoute(tokenIn, tokenOut),
  amountIn: newAmountFromString('99', tokenIn),
  amountOut: newAmountFromString('990', tokenOut),
  tradeType: TradeType.EXACT_INPUT,
});

const buildExactOutputQuote = (tokenIn = IMX_TEST_TOKEN, tokenOut = FUN_TEST_TOKEN): QuoteResult => ({
  gasEstimate,
  route: buildSinglePoolRoute(tokenIn, tokenOut),
  amountIn: newAmountFromString('100', tokenIn),
  amountOut: newAmountFromString('1000', tokenOut),
  tradeType: TradeType.EXACT_OUTPUT,
});

const buildMultiExactInputQuote = (
  tokenIn = IMX_TEST_TOKEN,
  tokenMiddle = WIMX_TEST_TOKEN,
  tokenOut = FUN_TEST_TOKEN,
): QuoteResult => ({
  gasEstimate,
  route: buildMultiPoolRoute(tokenIn, tokenMiddle, tokenOut),
  amountIn: newAmountFromString('99', tokenIn),
  amountOut: newAmountFromString('990', tokenOut),
  tradeType: TradeType.EXACT_INPUT,
});

const buildMultiExactOutputQuote = (
  tokenIn = IMX_TEST_TOKEN,
  tokenMiddle = WIMX_TEST_TOKEN,
  tokenOut = FUN_TEST_TOKEN,
): QuoteResult => ({
  gasEstimate,
  route: buildMultiPoolRoute(tokenIn, tokenMiddle, tokenOut),
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
      quote.amountOut.value = parseEther('990');

      const swap = getSwap(
        quote.amountIn.token,
        quote.amountOut.token,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('swapProxyContract'),
        newAmount(BigInt(0), NATIVE_TEST_TOKEN),
        [],
      );

      expectToBeDefined(swap.transaction.data);
      const { swapParams } = decodeMulticallExactInputSingleWithoutFees(swap.transaction.data);

      expect(typeof swapParams.amountOutMinimum).toBe('bigint');
      expect(formatEther(swapParams.amountOutMinimum)).toEqual('961.165048543689320388');
    });

    it('adds non-inverted slippage to calculate the amountInMaximum', () => {
      const quote = buildExactOutputQuote();
      quote.amountIn.value = parseEther('100');

      const swap = getSwap(
        quote.amountIn.token,
        quote.amountOut.token,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('swapProxyContract'),
        newAmount(BigInt(0), NATIVE_TEST_TOKEN),
        [],
      );

      expectToBeDefined(swap.transaction.data);
      const { swapParams } = decodeMulticallExactOutputSingleWithoutFees(swap.transaction.data);

      expect(typeof swapParams.amountInMaximum).toBe('bigint');
      expect(formatEther(swapParams.amountInMaximum)).toEqual('103.0');
    });
  });

  describe('recipient', () => {
    describe('without fees, and native out', () => {
      it('sets the recipient as the uniswap router contract', () => {
        const quote = buildExactInputQuote();

        const swap = getSwap(
          quote.amountIn.token,
          nativeTokenService.nativeToken,
          quote,
          makeAddr('fromAddress'),
          slippagePercentage,
          deadline,
          makeAddr('routerContract'),
          makeAddr('swapProxyContract'),
          newAmount(BigInt(0), NATIVE_TEST_TOKEN),
          [],
        );

        expectToBeDefined(swap.transaction.data);
        const { swapParams } = decodeMulticallExactInputSingleWithoutFees(swap.transaction.data);
        expectToBeString(swapParams.recipient);
        expect(swapParams.recipient.toLowerCase()).toEqual(makeAddr('routerContract'));
      });
    });

    describe('when erc20 out', () => {
      it('sets the recipient as the fromAddress', () => {
        const quote = buildExactInputQuote();

        const swap = getSwap(
          quote.amountIn.token,
          quote.amountOut.token,
          quote,
          makeAddr('fromAddress'),
          slippagePercentage,
          deadline,
          makeAddr('routerContract'),
          makeAddr('swapProxyContract'),
          newAmount(BigInt(0), NATIVE_TEST_TOKEN),
          [],
        );

        expectToBeDefined(swap.transaction.data);
        const { swapParams } = decodeMulticallExactInputSingleWithoutFees(swap.transaction.data);
        expectToBeString(swapParams.recipient);
        expect(swapParams.recipient.toLowerCase()).toEqual(makeAddr('fromAddress'));
      });
    });

    describe('with fees, and native out', () => {
      it('sets the recipient as the secondary fee contract', () => {
        const quote = buildExactInputQuote();

        const swap = getSwap(
          quote.amountIn.token,
          nativeTokenService.nativeToken,
          quote,
          makeAddr('fromAddress'),
          slippagePercentage,
          deadline,
          makeAddr('routerContract'),
          makeAddr('swapProxyContract'),
          newAmount(BigInt(0), NATIVE_TEST_TOKEN),
          [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
        );

        expectToBeDefined(swap.transaction.data);
        const { swapParams } = decodeMulticallExactInputSingleWithFees(swap.transaction.data);
        expectToBeString(swapParams.recipient);
        expect(swapParams.recipient.toLowerCase()).toEqual(makeAddr('swapProxyContract'));
      });
    });
  });

  describe('with fees', () => {
    it('subtracts inverted slippage to calculate the amountOutMinimum', () => {
      const quote = buildExactInputQuote();
      quote.amountOut.value = parseEther('990');

      const swap = getSwap(
        quote.amountIn.token,
        quote.amountOut.token,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('swapProxyContract'),
        newAmount(BigInt(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expectToBeDefined(swap.transaction.data);
      const { swapParams } = decodeMulticallExactInputSingleWithFees(swap.transaction.data);

      expect(typeof swapParams.amountOutMinimum).toBe('bigint');
      expect(formatEther(swapParams.amountOutMinimum)).toEqual('961.165048543689320388');
    });

    it('adds non-inverted slippage to calculate the amountInMaximum', () => {
      const quote = buildExactOutputQuote();
      quote.amountIn.value = parseEther('100');

      const swap = getSwap(
        quote.amountIn.token,
        quote.amountOut.token,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('swapProxyContract'),
        newAmount(BigInt(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expectToBeDefined(swap.transaction.data);
      const { swapParams } = decodeMulticallExactOutputSingleWithFees(swap.transaction.data);

      expect(typeof swapParams.amountInMaximum).toBe('bigint');
      expect(formatEther(swapParams.amountInMaximum)).toEqual('103.0');
    });
  });

  describe('with EXACT_INPUT + native amount in', () => {
    it('uses the amountSpecified as the transaction value', () => {
      const originalTokenIn = nativeTokenService.nativeToken;
      const originalTokenOut = FUN_TEST_TOKEN;
      const quote = buildExactInputQuote(nativeTokenService.wrappedToken, FUN_TEST_TOKEN);
      quote.amountIn.value = parseEther('99');

      const swap = getSwap(
        originalTokenIn,
        originalTokenOut,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('swapProxyContract'),
        newAmount(BigInt(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expect(formatEther(BigInt(swap.transaction.value ?? 0))).toEqual('99.0');
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
        makeAddr('swapProxyContract'),
        newAmount(BigInt(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expect(swap.transaction.value).toEqual('0x00');
    });
  });

  describe('with fees + EXACT_INPUT + single pool + native out', () => {
    it('adds an unwrapNativeToken to the calldata', () => {
      const quote = buildExactInputQuote(FUN_TEST_TOKEN, nativeTokenService.wrappedToken);
      quote.amountOut.value = parseEther('990');

      const swap = getSwap(
        quote.amountIn.token,
        nativeTokenService.nativeToken,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('swapProxyContract'),
        newAmount(BigInt(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expectToBeDefined(swap.transaction.data);
      const { unwrapTokenParams } = decodeMulticallExactInputSingleWithFees(swap.transaction.data);
      expect(formatEther(unwrapTokenParams[0])).toEqual('961.165048543689320388'); // amountOut less 3% slippage (/103*100)
    });
  });

  describe('with fees + EXACT_INPUT + multi pool + native out', () => {
    it('adds an unwrapNativeToken to the calldata', () => {
      const quote = buildMultiExactInputQuote(FUN_TEST_TOKEN, USDC_TEST_TOKEN, nativeTokenService.wrappedToken);
      quote.amountOut.value = parseEther('990');

      const swap = getSwap(
        quote.amountIn.token,
        nativeTokenService.nativeToken,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('swapProxyContract'),
        newAmount(BigInt(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expectToBeDefined(swap.transaction.data);
      const { unwrapTokenParams } = decodeMulticallExactInputWithFees(swap.transaction.data);
      expect(formatEther(unwrapTokenParams[0])).toEqual('961.165048543689320388'); // amountOut less 3% slippage (/103*100)
    });
  });

  describe('with EXACT_OUTPUT + native amount in', () => {
    it('sets the transaction value to the max amount in including slippage', () => {
      const originalTokenIn = nativeTokenService.nativeToken;
      const originalTokenOut = FUN_TEST_TOKEN;
      const quote = buildExactOutputQuote(nativeTokenService.wrappedToken, FUN_TEST_TOKEN);
      quote.amountIn.value = parseEther('100');

      const swap = getSwap(
        originalTokenIn,
        originalTokenOut,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('swapProxyContract'),
        newAmount(BigInt(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expect(formatEther(BigInt(swap.transaction.value ?? 0))).toEqual('103.0');
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
        makeAddr('swapProxyContract'),
        newAmount(BigInt(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expect(swap.transaction.value).toEqual('0x00');
    });
  });

  describe('with fees + EXACT_OUTPUT + single pool + native out', () => {
    it('adds an unwrapNativeToken to the calldata', () => {
      const quote = buildExactOutputQuote(FUN_TEST_TOKEN, nativeTokenService.wrappedToken);

      const swap = getSwap(
        quote.amountIn.token,
        nativeTokenService.nativeToken,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('swapProxyContract'),
        newAmount(BigInt(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expectToBeDefined(swap.transaction.data);
      const { unwrapTokenParams } = decodeMulticallExactOutputSingleWithFees(swap.transaction.data);
      expect(formatEther(unwrapTokenParams[0])).toEqual(formatAmount(quote.amountOut));
    });
  });

  describe('with fees + EXACT_OUTPUT + multi pool + native out', () => {
    it('adds an unwrapNativeToken to the calldata', () => {
      const quote = buildMultiExactOutputQuote(FUN_TEST_TOKEN, USDC_TEST_TOKEN, nativeTokenService.wrappedToken);

      const swap = getSwap(
        quote.amountIn.token,
        nativeTokenService.nativeToken,
        quote,
        makeAddr('fromAddress'),
        slippagePercentage,
        deadline,
        makeAddr('routerContract'),
        makeAddr('swapProxyContract'),
        newAmount(BigInt(0), NATIVE_TEST_TOKEN),
        [{ basisPoints: 100, recipient: makeAddr('feeRecipient') }],
      );

      expectToBeDefined(swap.transaction.data);
      const { unwrapTokenParams } = decodeMulticallExactOutputWithFees(swap.transaction.data);
      expect(formatEther(unwrapTokenParams[0])).toEqual(formatAmount(quote.amountOut));
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
          route: buildSinglePoolRoute(WIMX_TEST_TOKEN, FUN_TEST_TOKEN),
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
        quote.amountOut.value = parseEther('100');
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
          route: buildSinglePoolRoute(WIMX_TEST_TOKEN, FUN_TEST_TOKEN),
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

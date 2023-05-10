import { QuoteResponse, QuoteTradeInfo } from 'lib';
import { estimateIntermediateSwapFees } from './estimation';
import { Currency, TradeType } from '@uniswap/sdk-core';
import { FeeAmount, Pool, Route, TickMath } from '@uniswap/v3-sdk';
import { ethers } from 'ethers';
import { USDC_TEST_CHAIN, WETH_TEST_CHAIN } from 'utils/testUtils';
// import { getXAndY } from './estimation';

jest.mock('./temp', () => {
  return {
    ...jest.requireActual('./temp'),
    // getXAndY: jest.fn(),
    __esmodule: true,
    getXAndY: () => [
      ethers.BigNumber.from('123'),
      ethers.BigNumber.from('456'),
    ],
  };
});

/*
const estimationMock = jest.spyOn(estimation, 'getTokenAmounts');
estimationMock.mockReturnValueOnce([
  ethers.BigNumber.from('123'),
  ethers.BigNumber.from('456'),
  '789',
  '101112',
]);
*/

describe('estimateIntermediateSwapFees', () => {
  describe('with one hop', () => {
    it('returns the amountIn', async () => {
      const amountIn = ethers.utils.parseEther('10');
      const amountOut = ethers.utils.parseEther('1000');
      // (getXAndY as jest.Mock).mockReturnValue(['123', '456']);

      const arbitraryTick = 100;
      const arbitraryLiquidity = 10;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      // We are mocking the x and y from liquidity so these don't matter.
      const pools: Pool[] = [
        new Pool(
          USDC_TEST_CHAIN,
          WETH_TEST_CHAIN,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          arbitraryLiquidity,
          arbitraryTick
        ),
      ];
      const route: Route<Currency, Currency> = new Route(
        pools,
        USDC_TEST_CHAIN,
        WETH_TEST_CHAIN
      );
      const routeAndQuote: QuoteResponse = {
        success: true,
        trade: {
          route: route,
          amountIn: amountIn,
          tokenIn: USDC_TEST_CHAIN,
          tokenOut: WETH_TEST_CHAIN,
          amountOut: amountOut,
          tradeType: TradeType.EXACT_INPUT,
        },
      };

      estimateIntermediateSwapFees(routeAndQuote);
    });
  });
});

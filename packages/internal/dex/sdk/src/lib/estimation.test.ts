import {
  QuoteResponse,
  convertTokenDecimalsToWei,
  convertWeiToTokenDecimals,
} from 'lib';
import { Currency, Token, TradeType } from '@uniswap/sdk-core';

import { Pool, Route } from '@uniswap/v3-sdk';
import { ethers } from 'ethers';
import {
  TEST_CHAIN_ID,
  USDC_TEST_CHAIN,
  WETH_TEST_CHAIN,
  generatePool,
  randomAddress,
} from 'utils/testUtils';
import { getEstimatedSwapFee } from './estimation';
import { getXAndY } from './temp';

jest.mock('./temp', () => ({
  ...jest.requireActual('./temp'),
  getXAndY: jest.fn(),
  __esmodule: true,
}));

function calculateFeeAmount(
  pool: Pool,
  amount: ethers.BigNumber
): ethers.BigNumber {
  return amount.mul(pool.fee).div(1000000);
}

describe('getEstimatedSwapFee', () => {
  describe('with one hop', () => {
    it('returns the amountIn', async () => {
      const amountIn = ethers.utils.parseUnits('10', '6');
      const amountOut = ethers.utils.parseEther('1000');
      const tokenIn = USDC_TEST_CHAIN;
      const tokenOut = WETH_TEST_CHAIN;

      // We are mocking the x and y from liquidity so these don't matter.
      const pools: Pool[] = [generatePool(tokenIn, tokenOut)];
      const route: Route<Currency, Currency> = new Route(
        pools,
        USDC_TEST_CHAIN,
        WETH_TEST_CHAIN
      );

      const routeAndQuote: QuoteResponse = {
        success: true,
        trade: {
          route,
          amountIn,
          tokenIn,
          tokenOut,
          amountOut,
          tradeType: TradeType.EXACT_INPUT,
        },
      };

      // Don't need to mock getXAndY since it doesn't call it when pools.length == 1
      const fees = getEstimatedSwapFee(routeAndQuote);
      const expectedFeeAmount = calculateFeeAmount(pools[0], amountIn);
      expect(fees.toString()).toBe(expectedFeeAmount.toString());
    });
  });
  describe('with multiple hops', () => {
    describe('when all tokens have 18 decimals', () => {
      it('returns the value of all tokens in input tokens', async () => {
        const amountIn = ethers.utils.parseEther('10');
        const amountOut = ethers.utils.parseEther('1000');
        const x = ethers.utils.parseEther('500');
        const y = ethers.utils.parseEther('100');
        const tokens = [
          new Token(TEST_CHAIN_ID, randomAddress(), 18),
          new Token(TEST_CHAIN_ID, randomAddress(), 18),
          new Token(TEST_CHAIN_ID, randomAddress(), 18),
          new Token(TEST_CHAIN_ID, randomAddress(), 18),
        ];
        tokens.sort((a, b) => (a.sortsBefore(b) ? -1 : 1));
        const tokenIn = tokens[0];
        const tokenOut = tokens[tokens.length - 1];

        (getXAndY as jest.Mock).mockReturnValue([x, y]);

        // pool1 -> pool2 -> pool3
        // tokenIn -> Y, Y -> Z, Z -> tokenOut
        const pools: Pool[] = [
          generatePool(tokens[0], tokens[1]),
          generatePool(tokens[1], tokens[2]),
          generatePool(tokens[2], tokens[3]),
        ];

        const route: Route<Currency, Currency> = new Route(
          pools,
          tokenIn,
          tokenOut
        );
        const routeAndQuote: QuoteResponse = {
          success: true,
          trade: {
            route,
            amountIn,
            tokenIn,
            tokenOut,
            amountOut,
            tradeType: TradeType.EXACT_INPUT,
          },
        };
        const total = getEstimatedSwapFee(routeAndQuote);
        const expectedFeeAmount0 = calculateFeeAmount(pools[0], amountIn);
        // If the first fee is 1%, amount in is actually `in = amountIn - (amountIn * 0.01)`
        // if first x, y is 500, 100, x * y = k = 50000.
        // newX = 500+in, newY = 50000/newX = 50000 /(500+9.9) = 98.058442831927828986
        // yDelta = 100 - newY = 1.941557168072171014
        const yDelta0 = ethers.utils.parseEther('1.941557168072171014');
        const expectedFeeAmount1 = calculateFeeAmount(pools[1], yDelta0);
        // If the second fee is 1%, amount in is actually `in = amountIn - (amountIn * 0.01) = yDelta1 - (yDelta1 * 0.01)`
        // in = 1.941557168072171014 - (1.941557168072171014 * 0.01) = 1.922141596391449304
        // x = 500, y = 100, k = 50000
        // newX = 500 + in = 501.922141596391449304, newY = 50000/newX = 99.617043872526131158
        const yDelta1 = y.sub(ethers.utils.parseEther('99.617043872526131158'));
        const expectedFeeAmount2 = calculateFeeAmount(pools[2], yDelta1);
        // The amount y paid as a fee in x is `x * feePaid / y`
        const y1InX = x.mul(expectedFeeAmount2).div(y);
        const y0InX = x.mul(expectedFeeAmount1.add(y1InX)).div(y);
        const expectedTotalFeeAmount = expectedFeeAmount0.add(y0InX);

        expect(total.toString()).toBe(expectedTotalFeeAmount.toString());
      });
    });
    describe('when tokens have different decimals', () => {
      it('returns the value of all tokens in input tokens', async () => {
        const x = ethers.utils.parseEther('500');
        const y = ethers.utils.parseEther('100');
        const tokens = [
          new Token(TEST_CHAIN_ID, randomAddress(), 18),
          new Token(TEST_CHAIN_ID, randomAddress(), 16),
          new Token(TEST_CHAIN_ID, randomAddress(), 13),
          new Token(TEST_CHAIN_ID, randomAddress(), 10),
        ];
        tokens.sort((a, b) => (a.sortsBefore(b) ? -1 : 1));
        const amountIn = ethers.utils.parseUnits('10', tokens[0].decimals);
        const amountOut = ethers.utils.parseEther('1000');
        const tokenIn = tokens[0];
        const tokenOut = tokens[tokens.length - 1];

        (getXAndY as jest.Mock).mockReturnValue([x, y]);

        // pool1 -> pool2 -> pool3
        // tokenIn -> Y, Y -> Z, Z -> tokenOut
        const pools: Pool[] = [
          generatePool(tokens[0], tokens[1]),
          generatePool(tokens[1], tokens[2]),
          generatePool(tokens[2], tokens[3]),
        ];

        const route: Route<Currency, Currency> = new Route(
          pools,
          tokenIn,
          tokenOut
        );
        const routeAndQuote: QuoteResponse = {
          success: true,
          trade: {
            route,
            amountIn,
            tokenIn,
            tokenOut,
            amountOut,
            tradeType: TradeType.EXACT_INPUT,
          },
        };
        const total = getEstimatedSwapFee(routeAndQuote);

        const expectedFeeAmount0 = calculateFeeAmount(
          pools[0],
          convertTokenDecimalsToWei(amountIn, tokenIn.decimals)
        );
        // If the first fee is 1%, amount in is actually `in = amountIn - (amountIn * 0.01)`
        // if first x, y is 500, 100, x * y = k = 50000.
        // newX = 500+in, newY = 50000/newX = 50000 /(500+9.9) = 98.058442831927828986
        // yDelta = 100 - newY = 1.941557168072171014
        const yDelta0 = ethers.utils.parseEther('1.941557168072171014');
        const expectedFeeAmount1 = calculateFeeAmount(pools[1], yDelta0);
        // If the second fee is 1%, amount in is actually `in = amountIn - (amountIn * 0.01) = yDelta1 - (yDelta1 * 0.01)`
        // in = 1.941557168072171014 - (1.941557168072171014 * 0.01) = 1.922141596391449304
        // x = 500, y = 100, k = 50000
        // newX = 500 + in = 501.922141596391449304, newY = 50000/newX = 99.617043872526131158
        const yDelta1 = y.sub(ethers.utils.parseEther('99.617043872526131158'));
        const expectedFeeAmount2 = calculateFeeAmount(pools[2], yDelta1);
        // The amount y paid as a fee in x is `x * feePaid / y`
        const y1InX = x.mul(expectedFeeAmount2).div(y);
        const y0InX = x.mul(expectedFeeAmount1.add(y1InX)).div(y);
        // const y0InX = x.mul(expectedFeeAmount1).div(y);
        const expectedTotalFeeAmount = expectedFeeAmount0.add(y0InX);

        expect(total.toString()).toBe(
          convertWeiToTokenDecimals(
            expectedTotalFeeAmount,
            tokenIn.decimals
          ).toString()
        );
      });
    });
  });
});

import { describe, expect, it } from '@jest/globals';
import { ethers } from 'ethers';
import { Currency, Token, TradeType } from '@uniswap/sdk-core';
import {
  FeeAmount, Pool, Route, TickMath,
} from '@uniswap/v3-sdk';
import { Exchange } from './exchange';
import { Router } from './lib/router';
import {
  IMX_TEST_CHAIN,
  TEST_DEX_CONFIGURATION,
  WETH_TEST_CHAIN,
} from './utils/testUtils';
import { ExchangeConfiguration } from './config';

jest.mock('./lib/router');
jest.mock('./lib/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esmodule: true,
  ...jest.requireActual('./lib/utils'),
  getERC20Decimals: async () => 18,
}));

const wethToken: Token = WETH_TEST_CHAIN;
const imxToken: Token = IMX_TEST_CHAIN;

describe('getQuoteFromAmountIn', () => {
  describe('When valid quote returned', () => {
    it('Returns top-level data', async () => {
      const maxHops = 2;
      const amountIn = ethers.utils.parseEther('1000').toString();
      const amountOut = ethers.utils.parseEther('20000').toString();
      const arbitraryTick = 100;
      const arbitraryLiquidity = 10;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      const pools: Pool[] = [
        new Pool(
          wethToken,
          imxToken,
          FeeAmount.HIGH,
          sqrtPriceAtTick,
          arbitraryLiquidity,
          arbitraryTick,
        ),
        new Pool(
          wethToken,
          imxToken,
          FeeAmount.LOW,
          sqrtPriceAtTick,
          arbitraryLiquidity,
          arbitraryTick,
        ),
      ];
      const route: Route<Currency, Currency> = new Route(
        pools,
        wethToken,
        imxToken,
      );
      const tradeType: TradeType = TradeType.EXACT_INPUT;

      (Router as unknown as jest.Mock).mockImplementationOnce(() => ({
        findOptimalRoute: () => ({
          success: true,
          trade: {
            route,
            amountIn,
            tokenIn: wethToken,
            amountOut,
            tokenOut: imxToken,
            tradeType,
          },
        }),
      }));

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);
      const result = await exchange.getQuoteFromAmountIn(
        wethToken.address,
        imxToken.address,
        amountIn,
        maxHops,
      );
      expect(result.trade?.route).toBe(route);
      expect(result.trade?.amountIn).toBe(amountIn);
      expect(result.trade?.tokenIn).toBe(wethToken);
      expect(result.trade?.amountOut).toBe(amountOut);
      expect(result.trade?.tokenOut).toBe(imxToken);
      expect(result.trade?.tradeType).toBe(tradeType);
      expect(result.success).toBe(true);
    });
  });

  describe('When invalid quote returned', () => {
    it('Returns top-level data', async () => {
      const maxHops = 2;
      const amountIn = ethers.utils.parseEther('1000').toString();

      (Router as unknown as jest.Mock).mockImplementationOnce(() => ({
        findOptimalRoute: () => ({
          success: false,
          trade: undefined,
        }),
      }));

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);
      const result = await exchange.getQuoteFromAmountIn(
        wethToken.address,
        imxToken.address,
        amountIn,
        maxHops,
      );
      expect(result.trade).toBe(undefined);
      expect(result.success).toBe(false);
    });
  });

  describe('When no route found', () => {
    it('Returns NO_ROUTE_FOUND', async () => {
      const maxHops = 2;
      const amountIn = ethers.utils.parseEther('1000').toString();

      (Router as unknown as jest.Mock).mockImplementationOnce(() => ({
        findOptimalRoute: () => ({
          success: false,
          trade: undefined,
        }),
      }));

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);
      const result = await exchange.getQuoteFromAmountIn(
        wethToken.address,
        imxToken.address,
        amountIn,
        maxHops,
      );
      expect(result.trade).toBe(undefined);
      expect(result.success).toBe(false);
    });
  });
});

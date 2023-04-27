import { describe, it } from '@jest/globals';
import { Exchange } from './exchange';
import { Percent, TradeType } from '@uniswap/sdk-core';
import {
  decodeMulticallData,
  mockRouterImplementation,
  setupSwapTxTest,
  TestDexConfiguration,
} from './utils/testUtils';
import * as utils from './lib/utils';
import { ExchangeConfiguration } from 'config';

jest.mock('./lib/router');
jest.mock('./lib/utils', () => {
  return {
    __esmodule: true,
    ...jest.requireActual('./lib/utils'),
    getERC20Decimals: async () => 18,
  };
});

const exactInputSingleSignature = '0x04e45aaf';

const DEFAULT_SLIPPAGE: Percent = new Percent(1, 1000); // 1/1000 = 0.001 = 0.1%

describe('getUnsignedSwapTxFromAmountIn', () => {
  describe('Swap with single pool and defaults', () => {
    it('Generates valid calldata', async () => {
      const params = setupSwapTxTest(DEFAULT_SLIPPAGE);

      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TestDexConfiguration);
      const exchange = new Exchange(configuration);

      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn
      );

      let data = tx.transactionRequest?.data?.toString() || '';

      const { functionCallParams, topLevelParams } = decodeMulticallData(data);

      expect(topLevelParams[1][0].slice(0, 10)).toBe(exactInputSingleSignature);

      expect(functionCallParams.tokenIn).toBe(params.inputToken); // input token
      expect(functionCallParams.tokenOut).toBe(params.outputToken); // output token
      expect(functionCallParams.fee).toBe(10000); // fee
      expect(functionCallParams.recipient).toBe(params.fromAddress); // Recipient
      expect(functionCallParams.firstAmount.toString()).toBe(
        params.amountIn.toString()
      ); // amountin
      expect(functionCallParams.secondAmount.toString()).toBe(
        params.minAmountOut.toString()
      ); // minAmountOut
      expect(functionCallParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
      // TODO Also check that tx.transactionRequest.to and .from are correct.
    });
  });

  describe('Swap with single pool and higher slippage tolerance', () => {
    it('Generates valid calldata', async () => {
      const higherSlippage = new Percent(2, 1000); // 0.2%
      const params = setupSwapTxTest(higherSlippage);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TestDexConfiguration);
      const exchange = new Exchange(configuration);

      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
        higherSlippage
      );

      let data = tx.transactionRequest?.data?.toString() || '';

      const { functionCallParams, topLevelParams } = decodeMulticallData(data);

      expect(topLevelParams[1][0].slice(0, 10)).toBe(exactInputSingleSignature);

      expect(functionCallParams.tokenIn).toBe(params.inputToken); // input token
      expect(functionCallParams.tokenOut).toBe(params.outputToken); // output token
      expect(functionCallParams.fee).toBe(10000); // fee
      expect(functionCallParams.recipient).toBe(params.fromAddress); // Recipient
      expect(functionCallParams.firstAmount.toString()).toBe(
        params.amountIn.toString()
      ); // amountin
      expect(functionCallParams.secondAmount.toString()).toBe(
        params.minAmountOut.toString()
      ); // minAmountOut
      expect(functionCallParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });
  });

  describe('Pass in invalid addresses', () => {
    it('throws InvalidAddress', async () => {
      const higherSlippage = new Percent(2, 1000); // 0.2%
      const params = setupSwapTxTest(higherSlippage);

      const configuration = new ExchangeConfiguration(TestDexConfiguration);
      const exchange = new Exchange(configuration);

      const invalidAddress = '0x0123abcdef';

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          invalidAddress,
          params.inputToken,
          params.outputToken,
          params.amountIn,
          higherSlippage
        )
      ).rejects.toThrow(
        new utils.InvalidAddress('Address is not valid: 0x0123abcdef')
      );

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          invalidAddress,
          params.outputToken,
          params.amountIn,
          higherSlippage
        )
      ).rejects.toThrow(utils.InvalidAddress);

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          invalidAddress,
          params.amountIn,
          higherSlippage
        )
      ).rejects.toThrow(utils.InvalidAddress);
    });
  });

  describe('Pass in maxHops > 10', () => {
    it('throws', async () => {
      const higherSlippage = new Percent(2, 1000); // 0.2%
      const params = setupSwapTxTest(higherSlippage);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TestDexConfiguration);
      const exchange = new Exchange(configuration);

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          params.amountIn,
          higherSlippage,
          11
        )
      ).rejects.toThrow();
    });
  });
});

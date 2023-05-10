import { describe, it } from '@jest/globals';
import { Percent, TradeType } from '@uniswap/sdk-core';
import { ExchangeConfiguration } from 'config';
import { Exchange } from './exchange';
import {
  decodeMulticallData,
  mockRouterImplementation,
  setupSwapTxTest,
  TEST_PERIPHERY_ROUTER_ADDRESS,
  TEST_DEX_CONFIGURATION,
} from './utils/testUtils';
import * as utils from './lib/utils';
import { Router } from './lib';

jest.mock('./lib/router');
jest.mock('./lib/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esmodule: true,
  ...jest.requireActual('./lib/utils'),
  getERC20Decimals: async () => 18,
}));

const exactInputSingleSignature = '0x04e45aaf';

const DEFAULT_SLIPPAGE: Percent = new Percent(1, 1000); // 1/1000 = 0.001 = 0.1%

describe('getUnsignedSwapTxFromAmountIn', () => {
  describe('When no route found', () => {
    it('Returns NO_ROUTE_FOUND', async () => {
      const params = setupSwapTxTest(DEFAULT_SLIPPAGE);

      (Router as unknown as jest.Mock).mockImplementationOnce(() => ({
        findOptimalRoute: () => ({
          success: false,
          trade: undefined,
        }),
      }));

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);
      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
      );

      expect(tx.info).toBe(undefined);
      expect(tx.transaction).toBe(undefined);
      expect(tx.success).toBe(false);
    });
  });

  describe('Swap with single pool and defaults', () => {
    it('Generates valid calldata', async () => {
      const params = setupSwapTxTest(DEFAULT_SLIPPAGE);

      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
      );

      const data = tx.transaction?.data?.toString() || '';

      const { functionCallParams, topLevelParams } = decodeMulticallData(data);

      expect(topLevelParams[1][0].slice(0, 10)).toBe(exactInputSingleSignature);

      expect(functionCallParams.tokenIn).toBe(params.inputToken); // input token
      expect(functionCallParams.tokenOut).toBe(params.outputToken); // output token
      expect(functionCallParams.fee).toBe(10000); // fee
      expect(functionCallParams.recipient).toBe(params.fromAddress); // Recipient
      expect(tx.transaction?.to).toBe(TEST_PERIPHERY_ROUTER_ADDRESS); // to address
      expect(tx.transaction?.from).toBe(params.fromAddress); // from address
      expect(tx.transaction?.value).toBe('0x00'); // refers to 0ETH
      expect(functionCallParams.firstAmount.toString()).toBe(
        params.amountIn.toString(),
      ); // amountin
      expect(functionCallParams.secondAmount.toString()).toBe(
        params.minAmountOut.toString(),
      ); // minAmountOut
      expect(functionCallParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });

    it('returns valid quote', async () => {
      const params = setupSwapTxTest(DEFAULT_SLIPPAGE);

      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const { info, success } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
      );

      expect(success).toBe(true);
      expect(info).not.toBe(undefined);
      expect(info?.quote?.token.address).toEqual(params.outputToken);
      expect(info?.slippage).toBe('0.1%');
      expect(info?.quote?.amount.toString()).toEqual('10000000000000000000000');
      expect(info?.quoteWithMaxSlippage?.token.address).toEqual(
        params.outputToken,
      );
      expect(info?.quoteWithMaxSlippage?.amount.toString()).toEqual(
        '9990000000000000000000',
      );
    });
  });

  describe('Swap with single pool and higher slippage tolerance', () => {
    const higherSlippage = new Percent(2, 1000); // 0.2%

    it('Generates valid calldata', async () => {
      const params = setupSwapTxTest(higherSlippage);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
        higherSlippage,
      );

      const data = tx.transaction?.data?.toString() || '';

      const { functionCallParams, topLevelParams } = decodeMulticallData(data);

      expect(topLevelParams[1][0].slice(0, 10)).toBe(exactInputSingleSignature);

      expect(functionCallParams.tokenIn).toBe(params.inputToken); // input token
      expect(functionCallParams.tokenOut).toBe(params.outputToken); // output token
      expect(functionCallParams.fee).toBe(10000); // fee
      expect(functionCallParams.recipient).toBe(params.fromAddress); // Recipient
      expect(tx.transaction?.to).toBe(TEST_PERIPHERY_ROUTER_ADDRESS); // to address
      expect(tx.transaction?.from).toBe(params.fromAddress); // from address
      expect(tx.transaction?.value).toBe('0x00'); // refers to 0ETH
      expect(functionCallParams.firstAmount.toString()).toBe(
        params.amountIn.toString(),
      ); // amountin
      expect(functionCallParams.secondAmount.toString()).toBe(
        params.minAmountOut.toString(),
      ); // minAmountOut
      expect(functionCallParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });

    it('returns valid quote', async () => {
      const params = setupSwapTxTest(higherSlippage);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const { info, success } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
        higherSlippage,
      );

      expect(success).toBe(true);
      expect(info).not.toBe(undefined);
      expect(info?.quote?.token.address).toEqual(params.outputToken);
      expect(info?.slippage).toBe('0.2%');
      expect(info?.quote?.amount.toString()).toEqual('10000000000000000000000');
      expect(info?.quoteWithMaxSlippage?.token.address).toEqual(
        params.outputToken,
      );
      expect(info?.quoteWithMaxSlippage?.amount.toString()).toEqual(
        '9980000000000000000000',
      );
    });
  });

  describe('Pass in invalid addresses', () => {
    it('throws InvalidAddress', async () => {
      const higherSlippage = new Percent(2, 1000); // 0.2%
      const params = setupSwapTxTest(higherSlippage);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const invalidAddress = '0x0123abcdef';

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          invalidAddress,
          params.inputToken,
          params.outputToken,
          params.amountIn,
          higherSlippage,
        ),
      ).rejects.toThrow(
        new utils.InvalidAddress('Address is not valid: 0x0123abcdef'),
      );

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          invalidAddress,
          params.outputToken,
          params.amountIn,
          higherSlippage,
        ),
      ).rejects.toThrow(utils.InvalidAddress);

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          invalidAddress,
          params.amountIn,
          higherSlippage,
        ),
      ).rejects.toThrow(utils.InvalidAddress);
    });
  });

  describe('Pass in maxHops > 10', () => {
    it('throws', async () => {
      const higherSlippage = new Percent(2, 1000); // 0.2%
      const params = setupSwapTxTest(higherSlippage);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          params.amountIn,
          higherSlippage,
          11,
        ),
      ).rejects.toThrow();
    });
  });
});

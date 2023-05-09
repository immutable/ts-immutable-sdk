import { describe, it } from '@jest/globals';
import { Exchange } from './exchange';
import { ethers } from 'ethers';
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

const exactOutputSingleSignature = '0x5023b4df';

const DEFAULT_SLIPPAGE: Percent = new Percent(1, 1000); // 1/1000 = 0.001 = 0.1%

let configuration: ExchangeConfiguration;
let exchange: Exchange;

describe('getUnsignedSwapTxFromAmountOut', () => {
  beforeEach(() => {
    configuration = new ExchangeConfiguration(TestDexConfiguration);
    exchange = new Exchange(configuration);
  });
  describe('Swap with single pool and default slippage tolerance', () => {
    it('Generates valid calldata', async () => {
      const params = setupSwapTxTest(DEFAULT_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_OUTPUT);

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.RPC_URL
      );
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        return;
      }
      const wallet = new ethers.Wallet(privateKey, provider);

      const tx = await exchange.getUnsignedSwapTxFromAmountOut(
        wallet.address,
        params.inputToken,
        params.outputToken,
        params.amountOut
      );

      let data = tx.transaction?.data?.toString() || '';

      const { functionCallParams, topLevelParams } = decodeMulticallData(data);

      expect(topLevelParams[1][0].slice(0, 10)).toBe(
        exactOutputSingleSignature
      );

      expect(functionCallParams.tokenIn).toBe(params.inputToken); // input token
      expect(functionCallParams.tokenOut).toBe(params.outputToken); // output token
      expect(functionCallParams.fee).toBe(10000); // fee
      expect(functionCallParams.recipient).toBe(wallet.address); // Recipient
      expect(functionCallParams.firstAmount.toString()).toBe(
        params.amountOut.toString()
      ); // amountOut
      expect(functionCallParams.secondAmount.toString()).toBe(
        params.maxAmountIn.toString()
      ); // maxAmountIn
      expect(functionCallParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });
  });

  describe('Swap with single pool and higher slippage tolerance', () => {
    it('Generates valid calldata', async () => {
      const higherSlippage = new Percent(2, 1000); // 0.2%
      const params = setupSwapTxTest(higherSlippage);
      mockRouterImplementation(params, TradeType.EXACT_OUTPUT);

      const tx = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountOut,
        higherSlippage
      );

      let data = tx.transaction?.data?.toString() || '';

      if (!data) {
        return;
      }

      const { functionCallParams, topLevelParams } = decodeMulticallData(data);

      expect(topLevelParams[1][0].slice(0, 10)).toBe(
        exactOutputSingleSignature
      );

      expect(functionCallParams.tokenIn).toBe(params.inputToken); // input token
      expect(functionCallParams.tokenOut).toBe(params.outputToken); // output token
      expect(functionCallParams.fee).toBe(10000); // fee
      expect(functionCallParams.recipient).toBe(params.fromAddress); // Recipient
      expect(functionCallParams.firstAmount.toString()).toBe(
        params.amountOut.toString()
      ); // amountOut
      expect(functionCallParams.secondAmount.toString()).toBe(
        params.maxAmountIn.toString()
      ); // amountIn
      expect(functionCallParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });
  });

  describe('pass in invalid fromAddress', () => {
    it('reverts', async () => {
      const higherSlippage = new Percent(2, 1000); // 0.2%
      const params = setupSwapTxTest(higherSlippage);
      mockRouterImplementation(params, TradeType.EXACT_OUTPUT);

      const tx = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountOut,
        higherSlippage
      );

      let data = tx.transaction?.data?.toString() || '';

      const { functionCallParams, topLevelParams } = decodeMulticallData(data);

      expect(topLevelParams[1][0].slice(0, 10)).toBe(
        exactOutputSingleSignature
      );

      expect(functionCallParams.tokenIn).toBe(params.inputToken); // input token
      expect(functionCallParams.tokenOut).toBe(params.outputToken); // output token
      expect(functionCallParams.fee).toBe(10000); // fee
      expect(functionCallParams.recipient).toBe(params.fromAddress); // Recipient
      expect(functionCallParams.firstAmount.toString()).toBe(
        params.amountOut.toString()
      ); // amountOut
      expect(functionCallParams.secondAmount.toString()).toBe(
        params.maxAmountIn.toString()
      ); // amountIn
      expect(functionCallParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });
  });

  describe('Pass in invalid addresses', () => {
    it('throws InvalidAddress', async () => {
      const higherSlippage = new Percent(2, 1000); // 0.2%
      const params = setupSwapTxTest(higherSlippage);

      const invalidAddress = '0x0123abcdef';

      await expect(
        exchange.getUnsignedSwapTxFromAmountOut(
          invalidAddress,
          params.inputToken,
          params.outputToken,
          params.amountOut,
          higherSlippage
        )
      ).rejects.toThrow(
        new utils.InvalidAddress('Address is not valid: 0x0123abcdef')
      );

      await expect(
        exchange.getUnsignedSwapTxFromAmountOut(
          params.fromAddress,
          invalidAddress,
          params.outputToken,
          params.amountOut,
          higherSlippage
        )
      ).rejects.toThrow(utils.InvalidAddress);

      await expect(
        exchange.getUnsignedSwapTxFromAmountOut(
          params.fromAddress,
          params.inputToken,
          invalidAddress,
          params.amountOut,
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

      await expect(
        exchange.getUnsignedSwapTxFromAmountOut(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          params.amountOut,
          higherSlippage,
          11
        )
      ).rejects.toThrow();
    });
  });
});

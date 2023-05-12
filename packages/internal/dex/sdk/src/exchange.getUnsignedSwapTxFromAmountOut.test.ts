import { describe, it } from '@jest/globals';
import { ethers } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import { ExchangeConfiguration } from 'config';
import { ExchangeErrorTypes } from 'errors';
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

const exactOutputSingleSignature = '0x5023b4df';

const DEFAULT_SLIPPAGE = 0.1; // 1/1000 = 0.001 = 0.1%
const HIGHER_SLIPPAGE = 0.2; // 2/1000 = 0.002 = 0.2%

describe('getUnsignedSwapTxFromAmountOut', () => {
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
      const tx = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountOut,
      );

      expect(tx.info).toBe(undefined);
      expect(tx.transaction).toBe(undefined);
      expect(tx.success).toBe(false);
    });
  });

  describe('Swap with single pool and default slippage tolerance', () => {
    it('Generates valid calldata', async () => {
      const params = setupSwapTxTest(DEFAULT_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_OUTPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.RPC_URL,
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
        params.amountOut,
      );

      const data = tx.transaction?.data?.toString() || '';

      const { functionCallParams, topLevelParams } = decodeMulticallData(data);

      expect(topLevelParams[1][0].slice(0, 10)).toBe(
        exactOutputSingleSignature,
      );

      expect(functionCallParams.tokenIn).toBe(params.inputToken); // input token
      expect(functionCallParams.tokenOut).toBe(params.outputToken); // output token
      expect(functionCallParams.fee).toBe(10000); // fee
      expect(functionCallParams.recipient).toBe(wallet.address); // Recipient
      expect(tx.transaction?.to).toBe(TEST_PERIPHERY_ROUTER_ADDRESS); // to address
      expect(tx.transaction?.from).toBe(params.fromAddress); // from address
      expect(tx.transaction?.value).toBe('0x00'); // refers to 0ETH
      expect(functionCallParams.firstAmount.toString()).toBe(
        params.amountOut.toString(),
      ); // amountOut
      expect(functionCallParams.secondAmount.toString()).toBe(
        params.maxAmountIn.toString(),
      ); // maxAmountIn
      expect(functionCallParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });

    it('returns valid quote', async () => {
      const params = setupSwapTxTest(DEFAULT_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_OUTPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const { info, success } = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
      );

      expect(success).toBe(true);
      expect(info).not.toBe(undefined);
      expect(info?.quote?.token.address).toEqual(params.inputToken);
      expect(info?.slippage).toBe(0.1);
      expect(info?.quote?.amount.toString()).toEqual('12300000000000');
      expect(info?.quoteWithMaxSlippage?.token.address).toEqual(
        params.inputToken,
      );
      expect(info?.quoteWithMaxSlippage?.amount.toString()).toEqual(
        '12312300000000',
      );
    });
  });

  describe('Swap with single pool and higher slippage tolerance', () => {
    it('Generates valid calldata', async () => {
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_OUTPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const tx = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountOut,
        HIGHER_SLIPPAGE,
      );

      const data = tx.transaction?.data?.toString() || '';

      if (!data) {
        return;
      }

      const { functionCallParams, topLevelParams } = decodeMulticallData(data);

      expect(topLevelParams[1][0].slice(0, 10)).toBe(
        exactOutputSingleSignature,
      );

      expect(functionCallParams.tokenIn).toBe(params.inputToken); // input token
      expect(functionCallParams.tokenOut).toBe(params.outputToken); // output token
      expect(functionCallParams.fee).toBe(10000); // fee
      expect(functionCallParams.recipient).toBe(params.fromAddress); // Recipient
      expect(tx.transaction?.to).toBe(TEST_PERIPHERY_ROUTER_ADDRESS); // to address
      expect(tx.transaction?.from).toBe(params.fromAddress); // from address
      expect(tx.transaction?.value).toBe('0x00'); // refers to 0ETH
      expect(functionCallParams.firstAmount.toString()).toBe(
        params.amountOut.toString(),
      ); // amountOut
      expect(functionCallParams.secondAmount.toString()).toBe(
        params.maxAmountIn.toString(),
      ); // amountIn
      expect(functionCallParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });

    it('returns valid quote', async () => {
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_OUTPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const { info, success } = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
        HIGHER_SLIPPAGE,
      );

      expect(success).toBe(true);
      expect(info).not.toBe(undefined);
      expect(info?.quote?.token.address).toEqual(params.inputToken);
      expect(info?.slippage).toBe(0.2);
      expect(info?.quote?.amount.toString()).toEqual('12300000000000');
      expect(info?.quoteWithMaxSlippage?.token.address).toEqual(
        params.inputToken,
      );
      expect(info?.quoteWithMaxSlippage?.amount.toString()).toEqual(
        '12324600000000',
      );
    });
  });

  describe('pass in invalid fromAddress', () => {
    it('reverts', async () => {
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_OUTPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const tx = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountOut,
        HIGHER_SLIPPAGE,
      );

      const data = tx.transaction?.data?.toString() || '';

      const { functionCallParams, topLevelParams } = decodeMulticallData(data);

      expect(topLevelParams[1][0].slice(0, 10)).toBe(
        exactOutputSingleSignature,
      );

      expect(functionCallParams.tokenIn).toBe(params.inputToken); // input token
      expect(functionCallParams.tokenOut).toBe(params.outputToken); // output token
      expect(functionCallParams.fee).toBe(10000); // fee
      expect(functionCallParams.recipient).toBe(params.fromAddress); // Recipient
      expect(functionCallParams.firstAmount.toString()).toBe(
        params.amountOut.toString(),
      ); // amountOut
      expect(functionCallParams.secondAmount.toString()).toBe(
        params.maxAmountIn.toString(),
      ); // amountIn
      expect(functionCallParams.sqrtPriceLimitX96.toString()).toBe('0'); // sqrtPriceX96Limit
    });
  });

  describe('Pass in invalid addresses', () => {
    it('throws InvalidAddress', async () => {
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const invalidAddress = '0x0123abcdef';

      await expect(
        exchange.getUnsignedSwapTxFromAmountOut(
          invalidAddress,
          params.inputToken,
          params.outputToken,
          params.amountOut,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(
        new utils.InvalidAddress('Address is not valid: 0x0123abcdef'),
      );

      await expect(
        exchange.getUnsignedSwapTxFromAmountOut(
          params.fromAddress,
          invalidAddress,
          params.outputToken,
          params.amountOut,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(utils.InvalidAddress);

      await expect(
        exchange.getUnsignedSwapTxFromAmountOut(
          params.fromAddress,
          params.inputToken,
          invalidAddress,
          params.amountOut,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(utils.InvalidAddress);
    });
  });

  describe('Pass in maxHops > 10', () => {
    it('throws', async () => {
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      await expect(
        exchange.getUnsignedSwapTxFromAmountOut(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          params.amountOut,
          HIGHER_SLIPPAGE,
          11,
        ),
      ).rejects.toThrow();
    });
  });

  describe('With slippage greater than 50', () => {
    it('throws', async () => {
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      await expect(
        exchange.getUnsignedSwapTxFromAmountOut(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          params.amountIn,
          100,
          2,
        ),
      ).rejects.toThrow(ExchangeErrorTypes.INVALID_SLIPPAGE);
    });
  });

  describe('With slippage less than 0', () => {
    it('throws', async () => {
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      await expect(
        exchange.getUnsignedSwapTxFromAmountOut(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          params.amountIn,
          -5,
          2,
        ),
      ).rejects.toThrow(ExchangeErrorTypes.INVALID_SLIPPAGE);
    });
  });
});

import { JsonRpcProvider } from '@ethersproject/providers';
import { describe, it } from '@jest/globals';
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
  TEST_GAS_PRICE,
} from './utils/testUtils';
import * as utils from './lib/utils';
import { Router } from './lib';

jest.mock('@ethersproject/providers');
jest.mock('./lib/router');
jest.mock('./lib/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esmodule: true,
  ...jest.requireActual('./lib/utils'),
  getERC20Decimals: async () => 18,
}));

const exactInputSingleSignature = '0x04e45aaf';

const DEFAULT_SLIPPAGE = 0.1;
const HIGHER_SLIPPAGE = 0.2;

describe('getUnsignedSwapTxFromAmountIn', () => {
  beforeAll(() => {
    (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
      () => ({
        getFeeData: async () => ({
          maxFeePerGas: null,
          gasPrice: TEST_GAS_PRICE,
        }),
      }),
    ) as unknown as JsonRpcProvider;
  });

  describe('When no route found', () => {
    it('should return with success = false', async () => {
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
      expect(info?.slippage).toBe(0.1);
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
    it('Generates valid calldata', async () => {
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
        HIGHER_SLIPPAGE,
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
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const { info, success } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
        HIGHER_SLIPPAGE,
      );

      expect(success).toBe(true);
      expect(info).not.toBe(undefined);
      expect(info?.quote?.token.address).toEqual(params.outputToken);
      expect(info?.slippage).toBe(0.2);
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
    it('throws InvalidAddress error', async () => {
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const invalidAddress = '0x0123abcdef';

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          invalidAddress,
          params.inputToken,
          params.outputToken,
          params.amountIn,
          HIGHER_SLIPPAGE,
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
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(utils.InvalidAddress);

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          invalidAddress,
          params.amountIn,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(utils.InvalidAddress);
    });
  });

  describe('Pass in maxHops > 10', () => {
    it('throws INVALID_MAX_HOPS error', async () => {
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          params.amountIn,
          HIGHER_SLIPPAGE,
          11,
        ),
      ).rejects.toThrow(ExchangeErrorTypes.INVALID_MAX_HOPS);
    });
  });

  describe('With slippage greater than 50', () => {
    it('throws INVALID_SLIPPAGE error', async () => {
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
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
    it('throws INVALID_SLIPPAGE error', async () => {
      const params = setupSwapTxTest(HIGHER_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
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

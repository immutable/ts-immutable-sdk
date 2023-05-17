import { JsonRpcProvider } from '@ethersproject/providers';
import { describe, it } from '@jest/globals';
import { ethers } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import { ExchangeConfiguration } from 'config';
import {
  InvalidAddressError, InvalidMaxHopsError, InvalidSlippageError, NoRoutesAvailableError,
} from 'errors';
import { Exchange } from './exchange';
import {
  decodeMulticallData,
  mockRouterImplementation,
  setupSwapTxTest,
  TEST_PERIPHERY_ROUTER_ADDRESS,
  TEST_DEX_CONFIGURATION,
  TEST_GAS_PRICE,
  IMX_TEST_CHAIN,
} from './utils/testUtils';
import { Router } from './lib';

jest.mock('@ethersproject/providers');
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
    it('throws NoRoutesAvailableError', async () => {
      const params = setupSwapTxTest(DEFAULT_SLIPPAGE);

      (Router as unknown as jest.Mock).mockImplementationOnce(() => ({
        findOptimalRoute: jest.fn().mockRejectedValue(new NoRoutesAvailableError()),
      }));

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);
      await expect(exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
      )).rejects.toThrow(new NoRoutesAvailableError());
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

      const { info } = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
      );

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

      const { info } = await exchange.getUnsignedSwapTxFromAmountOut(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
        HIGHER_SLIPPAGE,
      );

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
      expect(info?.gasFeeEstimate?.amount).toEqual('300000000000000');
      expect(info?.gasFeeEstimate?.token.chainId).toEqual(IMX_TEST_CHAIN.chainId);
      expect(info?.gasFeeEstimate?.token.address).toEqual(IMX_TEST_CHAIN.address);
      expect(info?.gasFeeEstimate?.token.decimals).toEqual(IMX_TEST_CHAIN.decimals);
      expect(info?.gasFeeEstimate?.token.symbol).toEqual(IMX_TEST_CHAIN.symbol);
      expect(info?.gasFeeEstimate?.token.name).toEqual(IMX_TEST_CHAIN.name);
    });
  });

  describe('Pass in invalid addresses', () => {
    it('throws InvalidAddressError', async () => {
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
        new InvalidAddressError('Error: invalid from address'),
      );

      await expect(
        exchange.getUnsignedSwapTxFromAmountOut(
          params.fromAddress,
          invalidAddress,
          params.outputToken,
          params.amountOut,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(new InvalidAddressError('Error: invalid token in address'));

      await expect(
        exchange.getUnsignedSwapTxFromAmountOut(
          params.fromAddress,
          params.inputToken,
          invalidAddress,
          params.amountOut,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(new InvalidAddressError('Error: invalid token out address'));
    });
  });

  describe('Pass in maxHops > 10', () => {
    it('throws InvalidMaxHopsError', async () => {
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
      ).rejects.toThrow(new InvalidMaxHopsError('Error: max hops must be less than or equal to 10'));
    });
  });

  describe('Pass in maxHops < 1', () => {
    it('throws InvalidMaxHopsError', async () => {
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
          0,
        ),
      ).rejects.toThrow(new InvalidMaxHopsError('Error: max hops must be greater than or equal to 1'));
    });
  });

  describe('With slippage greater than 50', () => {
    it('throws InvalidSlippageError', async () => {
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
      ).rejects.toThrow(new InvalidSlippageError('Error: slippage percent must be less than or equal to 50'));
    });
  });

  describe('With slippage less than 0', () => {
    it('throws InvalidSlippageError', async () => {
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
      ).rejects.toThrow(new InvalidSlippageError('Error: slippage percent must be greater than or equal to 0'));
    });
  });
});

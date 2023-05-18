import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { describe, it } from '@jest/globals';
import { TradeType } from '@uniswap/sdk-core';
import { ExchangeConfiguration } from 'config';
import {
  InvalidAddressError, InvalidMaxHopsError, InvalidSlippageError, NoRoutesAvailableError,
} from 'errors';
import { ERC20__factory } from 'contracts/types/factories/ERC20__factory';
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
jest.mock('@ethersproject/contracts');
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
const APPROVED_AMOUNT = BigNumber.from('1000000000000000000');

describe('getUnsignedSwapTxFromAmountIn', () => {
  let erc20Contract: jest.Mock<any, any, any>;
  beforeAll(() => {
    erc20Contract = (Contract as unknown as jest.Mock).mockImplementation(
      () => ({
        allowance: jest.fn().mockResolvedValue(APPROVED_AMOUNT),
      }),
    );

    (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
      () => ({
        getFeeData: async () => ({
          maxFeePerGas: null,
          gasPrice: TEST_GAS_PRICE,
        }),
        connect: jest.fn().mockResolvedValue(erc20Contract),
      }),
    ) as unknown as JsonRpcProvider;
  });

  describe('When the swap transaction requires approval', () => {
    it('should include the unsigned approval transaction', async () => {
      const params = setupSwapTxTest(DEFAULT_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);
      const erc20ContractInterface = ERC20__factory.createInterface();

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      const amountIn = APPROVED_AMOUNT.add(BigNumber.from('1000000000000000000'));
      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        amountIn,
      );

      expect(tx.approval).not.toBe(null);
      const decodedResults = erc20ContractInterface.decodeFunctionData('approve', tx.approval?.data as string);
      expect(decodedResults[0]).toEqual(TEST_PERIPHERY_ROUTER_ADDRESS);
      // we have already approved 1000000000000000000, so we expect to approve 1000000000000000000 more
      expect(decodedResults[1].toString()).toEqual(APPROVED_AMOUNT.toString());
      expect(tx.approval?.to).toEqual(params.inputToken);
      expect(tx.approval?.from).toEqual(params.fromAddress);
      expect(tx.approval?.value).toEqual(0); // we do not want to send any ETH
    });
  });

  describe('When the swap transaction does not require approval', () => {
    it('should not include the unsigned approval transaction', async () => {
      const params = setupSwapTxTest(DEFAULT_SLIPPAGE);
      mockRouterImplementation(params, TradeType.EXACT_INPUT);

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);

      // Set the amountIn to be the same as the APPROVED_AMOUNT
      const tx = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        APPROVED_AMOUNT,
      );

      // we have already approved 1000000000000000000, so we don't expect to approve anything
      expect(tx.approval).toBe(null);
    });
  });

  describe('When no route found', () => {
    it('throws NoRoutesAvailableError', async () => {
      const params = setupSwapTxTest(DEFAULT_SLIPPAGE);

      (Router as unknown as jest.Mock).mockImplementationOnce(() => ({
        findOptimalRoute: jest.fn().mockRejectedValue(new NoRoutesAvailableError()),
      }));

      const configuration = new ExchangeConfiguration(TEST_DEX_CONFIGURATION);
      const exchange = new Exchange(configuration);
      await expect(exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
      )).rejects.toThrow(new NoRoutesAvailableError());
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

      const { info } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
      );

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

      const { info } = await exchange.getUnsignedSwapTxFromAmountIn(
        params.fromAddress,
        params.inputToken,
        params.outputToken,
        params.amountIn,
        HIGHER_SLIPPAGE,
      );

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
        exchange.getUnsignedSwapTxFromAmountIn(
          invalidAddress,
          params.inputToken,
          params.outputToken,
          params.amountIn,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(
        new InvalidAddressError('Error: invalid from address'),
      );

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          invalidAddress,
          params.outputToken,
          params.amountIn,
          HIGHER_SLIPPAGE,
        ),
      ).rejects.toThrow(new InvalidAddressError('Error: invalid token in address'));

      await expect(
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          invalidAddress,
          params.amountIn,
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
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          params.amountIn,
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
        exchange.getUnsignedSwapTxFromAmountIn(
          params.fromAddress,
          params.inputToken,
          params.outputToken,
          params.amountIn,
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
        exchange.getUnsignedSwapTxFromAmountIn(
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
        exchange.getUnsignedSwapTxFromAmountIn(
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

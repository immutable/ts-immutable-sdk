import { describe, it } from '@jest/globals';
import {
  FeeAmount, Pool, Route, TickMath,
} from '@uniswap/v3-sdk';
import { Token, CurrencyAmount, TradeType } from '@uniswap/sdk-core';
import { Contract, ethers, providers } from 'ethers';
import { ProviderCallError } from 'errors';
import { getQuotesForRoutes } from './getQuotesForRoutes';
import {
  IMX_TEST_CHAIN,
  TEST_CHAIN_ID,
  TEST_MULTICALL_ADDRESS,
  TEST_QUOTER_ADDRESS,
  TEST_RPC_URL,
  WETH_TEST_CHAIN,
} from '../utils/testUtils';
import { Multicall__factory } from '../contracts/types';

jest.mock('@ethersproject/contracts');

describe('getQuotesForRoutes', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockedMulticallContract: jest.Mock;

  describe('when multicall fails', () => {
    it('should throw ProviderCallError', async () => {
      mockedMulticallContract = (
        Contract as unknown as jest.Mock
      ).mockImplementationOnce(() => ({
        callStatic: {
          multicall: jest.fn().mockRejectedValue(new ProviderCallError('an rpc error message')),
        },
      }));

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const dummyRoutes: Route<Token, Token>[] = [];
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      // Since we will be mocking the multicall, routes doesn't matter,
      // as long as the length is correct.
      const pool0 = new Pool(
        WETH_TEST_CHAIN,
        IMX_TEST_CHAIN,
        FeeAmount.HIGH,
        sqrtPriceAtTick,
        1000,
        arbitraryTick,
      );
      dummyRoutes.push(new Route([pool0], WETH_TEST_CHAIN, IMX_TEST_CHAIN));
      dummyRoutes.push(new Route([pool0], WETH_TEST_CHAIN, IMX_TEST_CHAIN));

      const amount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(
        WETH_TEST_CHAIN,
        '123123',
      );

      await expect(getQuotesForRoutes(
        multicallContract,
        TEST_QUOTER_ADDRESS,
        dummyRoutes,
        amount,
        TradeType.EXACT_INPUT,
      )).rejects.toThrow(new ProviderCallError('failed multicall: an rpc error message'));
    });
  });

  describe('with one quote', () => {
    it('returns the only quote', async () => {
      const expectedAmountOut = ethers.utils.parseEther('1000');
      const expectedGasEstimate = '100000';
      const types = [
        'uint256', // amountOut/amountIn
        'uint160', // sqrtPrice after
        'uint32', // ticks crossed
        'uint256', // gasEstimate
      ];

      const encoded = ethers.utils.defaultAbiCoder.encode(types, [
        expectedAmountOut,
        '100',
        '1',
        expectedGasEstimate,
      ]);

      const mockReturnData = {
        returnData: [
          {
            returnData: encoded,
          },
        ],
      };

      mockedMulticallContract = (
        Contract as unknown as jest.Mock
      ).mockImplementationOnce(() => ({
        callStatic: {
          multicall: jest.fn().mockResolvedValueOnce(mockReturnData),
        },
      }));

      const dummyRoutes: Route<Token, Token>[] = [];
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      // Since we will be mocking the multicall, routes doesn't matter,
      // as long as the length is correct.
      const pool0 = new Pool(
        WETH_TEST_CHAIN,
        IMX_TEST_CHAIN,
        FeeAmount.HIGH,
        sqrtPriceAtTick,
        1000,
        arbitraryTick,
      );
      dummyRoutes.push(new Route([pool0], WETH_TEST_CHAIN, IMX_TEST_CHAIN));

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const amount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(
        WETH_TEST_CHAIN,
        '123123',
      );
      const amountOutReceived = await getQuotesForRoutes(
        multicallContract,
        TEST_QUOTER_ADDRESS,
        dummyRoutes,
        amount,
        TradeType.EXACT_INPUT,
      );
      expect(amountOutReceived.length).toEqual(1);
      expect(amountOutReceived[0].quoteAmount.toString()).toEqual(expectedAmountOut.toString());
      expect(amountOutReceived[0].gasEstimate.toString()).toEqual(expectedGasEstimate);
    });
  });

  describe('with multiple quotes', () => {
    it('returns all quotes', async () => {
      const expectedAmountOut1 = ethers.utils.parseEther('1000');
      const expectedAmountOut2 = ethers.utils.parseEther('2000');
      const expectedGasEstimate1 = '100000';
      const expectedGasEstimate2 = '200000';

      const types = [
        'uint256', // amountOut/amountIn
        'uint160', // sqrtPrice after
        'uint32', // ticks crossed
        'uint256', // gasEstimate
      ];

      const encoded1 = ethers.utils.defaultAbiCoder.encode(types, [
        expectedAmountOut1,
        '100',
        '1',
        expectedGasEstimate1,
      ]);
      const encoded2 = ethers.utils.defaultAbiCoder.encode(types, [
        expectedAmountOut2,
        '100',
        '1',
        expectedGasEstimate2,
      ]);

      const mockReturnData = {
        returnData: [
          {
            returnData: encoded1,
          },
          {
            returnData: encoded2,
          },
        ],
      };

      mockedMulticallContract = (
        Contract as unknown as jest.Mock
      ).mockImplementationOnce(() => ({
        callStatic: {
          multicall: jest.fn().mockResolvedValueOnce(mockReturnData),
        },
      }));

      const dummyRoutes: Route<Token, Token>[] = [];
      const arbitraryTick = 100;
      const sqrtPriceAtTick = TickMath.getSqrtRatioAtTick(arbitraryTick);
      // Since we will be mocking the multicall, routes doesn't matter,
      // as long as the length is correct.
      const pool0 = new Pool(
        WETH_TEST_CHAIN,
        IMX_TEST_CHAIN,
        FeeAmount.HIGH,
        sqrtPriceAtTick,
        1000,
        arbitraryTick,
      );
      dummyRoutes.push(new Route([pool0], WETH_TEST_CHAIN, IMX_TEST_CHAIN));
      dummyRoutes.push(new Route([pool0], WETH_TEST_CHAIN, IMX_TEST_CHAIN));

      const provider = new providers.JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );
      const multicallContract = Multicall__factory.connect(
        TEST_MULTICALL_ADDRESS,
        provider,
      );

      const amount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(
        WETH_TEST_CHAIN,
        '123123',
      );
      const amountOutReceived = await getQuotesForRoutes(
        multicallContract,
        TEST_QUOTER_ADDRESS,
        dummyRoutes,
        amount,
        TradeType.EXACT_INPUT,
      );
      expect(amountOutReceived.length).toBe(2);
      expect(amountOutReceived[0].quoteAmount.toString()).toBe(
        expectedAmountOut1.toString(),
      );
      expect(amountOutReceived[0].gasEstimate.toString()).toEqual(expectedGasEstimate1);
      expect(amountOutReceived[1].quoteAmount.toString()).toBe(
        expectedAmountOut2.toString(),
      );
      expect(amountOutReceived[1].gasEstimate.toString()).toEqual(expectedGasEstimate2);
    });
  });
});
